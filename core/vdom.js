import { watchEffect } from './reactivity.js'

const noOp = () => {}

function mount(vnode, container) {
    const el = vnode.el = document.createElement(vnode.tag)

    // Props
    if(vnode.props) {
        for(const key in vnode.props) {
            const value = vnode.props[key]

            if(key.startsWith('on')) {
                el.addEventListener(key.slice(2).toLowerCase(), value)
            }
            else {
                el.setAttribute(key, value)
            }
        }
    }

    // Children
    if(vnode.children) {
        if(typeof vnode.children === 'string') {
            el.textContent = vnode.children
        }
        else {
            for(const child of vnode.children) {
                mount(child, el)
            }
        }
    }

    container.appendChild(el)
}

function patch(n1, n2) {
    const el = n2.el = n1.el

    if(n1.tag === n2.tag) {
        const oldProps = n1.props || {}
        const newProps = n2.props || {}

        // Props
        for(const key in newProps) {
            const oldValue = oldProps[key]
            const newValue = newProps[key]

            if(newValue !== oldValue) {
                el.setAttribute(key, newValue)
            }
        }

        for(const key in oldProps) {
            if(!(key in newProps)) {
                el.removeAttribute(key)
            }
        }

        // Children
        const oldChildren = n1.children
        const newChildren = n2.children

        if(typeof newChildren === 'string') {
            if(typeof oldChildren === 'string') {
                if(newChildren !== oldChildren) {
                    el.textContent = newChildren
                }
            }
            else {
                el.textContent = newChildren
            }
        }
        else {
            if(typeof oldChildren === 'string') {
                el.innerHTML = ''

                for(const child of newChildren) {
                    mount(child, el)
                }
            }
            else {
                const commonLength = Math.min(oldChildren.length, newChildren.length)

                for(let i = 0; i < commonLength; i++) {
                    patch(oldChildren[i], newChildren[i])
                }

                if(oldChildren.length < newChildren.length) {
                    for(const child of newChildren.slice(oldChildren.length)) {
                        mount(child, el)
                    }
                }
                else if(oldChildren.length > newChildren.length) {
                    for(const child of oldChildren.slice(newChildren.length)) {
                        el.removeChild(child.el)
                    }
                }
            }
        }
    }
    else {
        // replacement function
    }
}

function processOptions (component) {
    if(component.$optionsProcessed) return

    if(component.methods) {
        for(let key in component.methods) {
            component.methods[key] = component.methods[key].bind(component)
        }
    }

    if(!component.render) component.render = noOp
    if(!component.mounted) component.mounted = noOp
    if(!component.updated) component.updated = noOp

    component.$optionsProcessed = true
}

export function h(tag, props, children) {
    return {
        tag,
        props,
        children
    }
}

export function createApp(component, selector) {
    const container = document.querySelector(selector)

    let isMounted = false
    let prevVdom

    processOptions(component)

    watchEffect(() => {
        if(!isMounted) {
            prevVdom = component.render()

            mount(prevVdom, container)
            isMounted = true
            component.mounted() // Mounted hook
        }
        else {
            const newVdom = component.render()

            patch(prevVdom, newVdom)
            prevVdom = newVdom
            component.updated() // Updated hook
        }
    })
}
