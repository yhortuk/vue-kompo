<template>
    <vl-form-field v-bind="$_wrapperAttributes" @labelclick="focus">

        <div class="vlInputGroup">
            <div class="vlInputPrepend" @click.stop="openCalendar" v-html="$_icon" />
            <flat-pickr 
                v-model="component.value"                                                    
                class="vlFormControl"
                ref="flatpickr"
                v-bind="$_attributes"
                v-on="$_events" 
                autocomplete="off" />
            <div class="vlInputAppend">
                <i v-if="$_value && !$_readOnly" class="icon-times" @click.stop="clear" />
            </div>
        </div>

    </vl-form-field>
</template>

<script>
import Field from '../mixins/Field'

import flatPickr from 'vue-flatpickr-component'; 
import 'flatpickr/dist/flatpickr.css';
import 'flatpickr/dist/themes/airbnb.css';

export default {
    mixins: [Field],
    components: { flatPickr },
    data(){
        return {
            dateCheck: null
        }
    },
    mounted(){
        this.dateCheck = this.$_value //to emit accurate change events
    },
    computed: {
        $_enableTime(){ return this.$_data('enableTime') || false },
        $_noCalendar(){ return this.$_data('noCalendar') || false },
        $_dateMode(){ return this.$_data('dateMode') || false },
        $_attributes(){
            return {
                ...this.$_defaultFieldAttributes,
                config: Object.assign({
                    wrap: true,
                    dateFormat: this.$_data('dateFormat'),
                    enableTime: this.$_enableTime,
                    noCalendar: this.$_noCalendar,
                    allowInput: true,
                    altInput: true,
                    altInputClass: 'vlFormControl',
                    altFormat: this.$_data('altFormat'),
                    time_24hr: true
                }, 
                    this.$_dateMode ? {mode: this.$_dateMode} : {}
                ),
                disabled: this.$_readOnly ? true : false
            }
        },
        $_events() { 
            return {
                ...this.$_defaultFieldEvents,
                blur: () => {}, //had to disable blur action because it was making me click twice on the calendar
                change: () => {},
                'on-change': this.onChange,
                'on-open': this.onOpen,
                'on-close': this.onClose
            }
        }
    },
    methods:{
        //useful methods if needed
        //this.$refs.flatpickr.fp._input.focus()
        //this.$refs.flatpickr.fp.close()
        openCalendar(){
            this.$refs.flatpickr.fp.open()
        },
        focus(){
            this.$refs.flatpickr.fp.showTimeInput = true //fix to show time in datetime
            if(this.$_noCalendar) //for Time, we want it to focus to the hour input
                setTimeout( () => this.$refs.flatpickr.fp.hourElement.focus(), 50)
        },
        onChange(selectedDates, dateStr, instance) {

            if(dateStr == this.dateCheck) //Flatpickr emits even if the date does not change... had to do the check myself
                return

            this.$_clearErrors()
            this.dateCheck = dateStr
            this.$_changeAction()

            this.$emit('change', dateStr, event) //there's a magical event variable that is defined when a date changes but not when time changes. seen on SO. used for tasks in condoedge
        },
        clear(){
            this.component.value = ''
            this.$_blurAction()
            this.$_changeAction()
        },
        onOpen(obj, value){
            this.focus()
            this.$emit('open', value, event)
        },
        onClose(obj, value){
            this.$emit('close', value, event)
        }
    }
}
</script>

