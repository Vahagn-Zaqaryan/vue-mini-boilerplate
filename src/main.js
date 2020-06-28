import { createApp, reactive, h } from '../core/vue-mini-core.js'

const App = {
    data: reactive({
        count: 0
    }),

    mounted() {
        console.log('App is mounted')
    },

    updated() {
        console.log('App is updated')
    },

    methods: {
        onClick() {
            this.data.count++
        }
    },

    render() {
        return h('div', { class: 'vue-mini-app' }, [
            h('div', { class: 'vue-mini-app-container' }, [
                h('span', null, String(this.data.count)),
                h('button',  {
                    onClick: this.methods.onClick
                }, 'Increment')
            ])
        ])
    },
}

createApp(App, '#app')
