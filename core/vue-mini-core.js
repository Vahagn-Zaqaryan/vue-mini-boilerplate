// Vdom
function h(tag, props, children) {
    return {
        tag,
        props,
        children
    }
}

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

// Reactivity
let activeEffect

class Dep {
    subscribers = new Set()

    depend() {
        if(activeEffect) {
            this.subscribers.add(activeEffect)
        }
    }

    notify() {
        for(const effect of this.subscribers) {
            effect()
        }
    }
}

function watchEffect(effect) {
    activeEffect = effect
    effect()
    activeEffect = null
}

const targetMap = new WeakMap()

function getDep(target, key) {
    let depsMap = targetMap.get(target)

    if(!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)

    if(!dep) {
        dep = new Dep()
        depsMap.set(key, dep)
    }

    return dep
}

const reactiveHandlers = {
    get(target, key, receiver) {
        const dep = getDep(target, key)

        dep.depend()
        return Reflect.get(target, key, reactive)
    },

    set(target, key, value, reactive) {
        const dep = getDep(target, key)
        const result = Reflect.set(target, key, value, reactive)

        dep.notify()
        return result
    }
}

function reactive(raw) {
    return new Proxy(raw, reactiveHandlers)
}

// Mounter
function mountApp(component, container) {
    let isMounted = false
    let prevVdom

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

export { mountApp, reactive, h }
