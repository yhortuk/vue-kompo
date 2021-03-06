<template>
    <vl-form-field v-bind="$_wrapperAttributes">
        <vlTaggableInput 
            v-click-out="blur"
            v-bind="$_taggableInputAttributes" 
            v-on="$_taggableInputEvents">
            <template v-slot:prepend v-if="$_icon">
                <div v-bind="prependIcon" />
            </template>
            <input
                class="vlFormControl"
                v-bind="$_attributes"
                v-on="$_events"
                v-model="inputValue"
                @keydown.enter.prevent="() => {}"
                ref="input"
                autocomplete="nope"
            />
            <template v-slot:append v-if="appendIcon && !$_readOnly">
                <i :class="appendIcon"/>
            </template>
        </vlTaggableInput>
        <div v-if="filteredOptions.length" class="vlOptions" :key="optionsKey">
            <div v-for="(option,key) in filteredOptions" :key="key"
                class="vlOption"
                :class="{
                    'vlSelected' : isSelected(option),
                    'vlHoveredOption' : key == hoveredOption
                }"
                @click.stop="select(option)"
                @mouseover="setHoveredOption(key)">
                <vlCustomLabel :vkompo="option.label" :kompoid="kompoid" />
            </div>
        </div>
        <div v-else class="vlOptions">
            <div class="vlOption" v-html="optionsMessage" />
        </div>

        <template v-slot:after>
            <slot name="after"/>
        </template>

    </vl-form-field>
</template>

<script>
import Field from '../mixins/Field'
import HasTaggableInput from '../mixins/HasTaggableInput'
import DoesAxiosRequests from '../mixins/DoesAxiosRequests'

export default {
    mixins: [Field, HasTaggableInput, DoesAxiosRequests],
    data(){
        return {
            optionsMessage: '',
            filteredOptions: [],
            hoveredOption: 0,
            updateForm: false,
            optionsKey: 0
        }
    },
    mounted(){
        this.filteredOptions = this.options
        this.optionsMessage = this.ajaxOptions ? this.enterMoreCharacters : this.noOptionsFound
    },
    computed: {
        $_events() {
            return {
                ...this.$_defaultFieldEvents,
                blur: () => {}, //do nothing
                change: () => {}, //do nothing
                click: this.loadOptions,
                keydown: this.keyDown,
            }
        },
        options(){ return this.component.options },
        prependIcon(){ 
            return {
                is: {template: this.$_icon}
            }
        },
        appendIcon(){ return this.$_data('searchInput') ? null : 
            (this.$_state('focusedField') ? 'icon-up' : 'icon-down') },
        noOptionsFound(){ return this.$_data('noOptionsFound')},
        enterMoreCharacters(){ return this.$_data('enterMoreCharacters')},
        $_pristine() { return this.$_value.length === 0 },
        $_emptyValue() { return [] },
        ajaxOptions(){ return this.$_data('ajaxOptions') },
        ajaxMinSearchLength(){ return this.$_data('ajaxMinSearchLength') },
        ajaxOptionsFromField(){ return this.$_data('ajaxOptionsFromField') },
        debouncedAjaxFunction(){ return _.debounce(this.loadOptionsByAjax, 300)}
    },
    methods: {
        $_setInitialValue(){
            this.component.value = this.getOptionFromValue() || this.$_emptyValue
        },
        getOptionFromValue(){
            return this.$_multiple ? 
                _.map(this.$_value, (val) => {
                    var index = _.findIndex(this.options, (option) => { return val == option.value })
                    return index !== -1 && this.options[index]
                }): 
                _.filter(this.options, (o) => {return o.value == this.$_value} )
        },
        keyDown(key){
            if(key.code == 'Tab')
                this.$_blurAction()
        },
        $_keyUp(key){
            if(key.code == 'ArrowUp'){
                this.prevOption()
            }else if(key.code == 'ArrowDown'){
                this.nextOption()
            }else if(key.code === 'Enter'){
                this.selectHoveredOption()
            }else if(key.code == 'Escape'){
                this.forceBlur()
            }else{
                this.loadOptions()
            }
        },
        loadOptions(){
            if(this.$_readOnly)
                return

            if(this.ajaxOptions){
                if(this.ajaxOptionsFromField){
                    this.inputValue ? this.filterOptions() : this.debouncedAjaxFunction()
                }else{
                    this.debouncedAjaxFunction()
                }
            }else{
                this.filterOptions()
            }
        },
        $_fill(jsonFormData){
            if(this.$_multiple){
                !this.$_value.length ? 
                    jsonFormData[this.$_name] = [] :
                    this.$_value.forEach((option, k) => {
                        jsonFormData[this.$_name+'['+k+']'] = option.value
                    })
            }else{
                jsonFormData[this.$_name] = this.$_value.length ? this.$_value[0].value : ''
            }
        },
        blur(){
            this.$_state('focusedField') && this.forceBlur()
        },
        forceBlur(){
            this.reset()
            this.$refs.input.blur()
            this.$_blurAction()            
        },
        select(option){
            this.isSelected(option) ? this.$_remove(this.indexOf(option)) : this.add(option)
            this.reset()
            this.$_blurAction()
        },
        filterOptions(){
            this.filteredOptions = _.filter(this.options, (opt) => {
                var searchable = (_.isObject(opt.label) ? opt.label.label : opt.label).toString().toLowerCase()
                return searchable.indexOf(this.inputValue.toString().toLowerCase()) !== -1
            })
        },
        add(option){
            if(this.$_multiple){
                this.component.value.push(option)
            }else{
                this.component.value = [option]
            }
            this.$_changeAction()
        },
        $_remove(index) {
            if(this.$_readOnly)
                return
            
            this.component.value.splice( index, 1)
            this.forceBlur()
            this.$_changeAction()
        },
        indexOf(option){
            return _.findIndex(this.component.value, {value: option.value})
        },
        isSelected(option){
            return this.indexOf(option) !== -1
        },
        reset(){
            this.$_emptyInput()
            if(this.ajaxOptions){
                this.component.options = []
                this.filteredOptions = []
            }
            this.hoveredOption = 0
        },
        prevOption(){
            this.hoveredOption = this.hoveredOption == 0 ? this.filteredOptions.length - 1 : this.hoveredOption - 1
        },
        nextOption(){
            this.hoveredOption = this.hoveredOption == this.filteredOptions.length - 1 ? 0 : this.hoveredOption + 1
        },
        setHoveredOption(key){
            this.hoveredOption = key
        },
        selectHoveredOption(){
            if(this.filteredOptions[this.hoveredOption])
                this.select(this.filteredOptions[this.hoveredOption])
        },
        loadOptionsByAjax(){

            if(this.ajaxOptionsFromField){
                
                this.$kompo.vlDeliverJsonFormData(this.kompoid, this.$_elKompoId)
                this.performAjax(this.$_getFromStore(this.ajaxOptionsFromField))

            }else{

                if(this.inputValue.length >= this.ajaxMinSearchLength){
                    this.performAjax()
                }else{
                    this.component.options = []
                    this.filteredOptions = []
                    this.optionsMessage = this.enterMoreCharacters
                }
            }
        },
        performAjax(search)
        {
            this.optionsMessage = '<i class="icon-spinner"/>'
            var initialSearch = search || this.inputValue

            this.$_kAxios.$_searchOptions(initialSearch).then(response => {

                if(!search && (initialSearch !== this.inputValue))
                    return
                
                if(!_.isArray(response.data))
                    return

                this.$set(this.component, 'options', response.data)
                this.$set(this, 'filteredOptions', response.data)
                this.optionsMessage = this.noOptionsFound
                this.optionsKey += 1
                
            })
        }
    }
}
</script>