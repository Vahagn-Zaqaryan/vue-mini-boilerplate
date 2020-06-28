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
    get(target, key) {
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

export function reactive(raw) {
    return new Proxy(raw, reactiveHandlers)
}

export function watchEffect(effect) {
    activeEffect = effect
    effect()
    activeEffect = null
}
