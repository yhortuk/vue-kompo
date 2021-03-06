import Field from '../mixins/Field'
export default {
    mixins: [Field],
    computed: {
        $_attributes(){
            return {
                ...this.$_defaultFieldAttributes,
                'aria-checked': this.checked
            }
        },
        $_events(){
            return {
                ...this.$_defaultFieldEvents,
                'keydown.prevent.space.enter': this.toggle, // keydown is not working with v-on object binding
                'click': this.toggle
            }
        },
        checked() {
            return Boolean(this.$_value)
        }
    },
    methods: {
        toggle() {
            if(this.$_readOnly)
                return

            this.handleToggle()
            this.$_togglesForm()
        },
        handleToggle(){
            this.component.value = !this.checked
            this.changed()
        },
        changed(){
            setTimeout(() => { //when label is clicked somehow we need to wait before $_value is set...
                this.$_changeAction()
                this.$_clearErrors()
            }, 50)
        },
        $_focusAction(){
            //do nothing
        },
        $_blurAction(){
            //do nothing
        },
    },
}