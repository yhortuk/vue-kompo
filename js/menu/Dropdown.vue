<template>
    <div v-bind="$_attributes">

        <div 
            class="vlDropdownToggler"
            :class="togglerClass" 
            @click="toggle">
            
            <slot />

            <label v-if="!$slots.default" v-html="$_label" />

        </div>

        <transition name="slideDown">

            <div class="vlDropdownMenu"
                :class="menuClass" >
            
                <slot name="komponents" />

                <div 
                    v-if="!$slots.komponents"
                    v-for="(col,index) in komponents"
                    :key="index">
                    <component 
                        v-bind="$_defaultLayoutAttributes(col)" />
                </div>
        
            </div>

        </transition>

    </div>
</template>

<script>
import MenuItem from './mixins/MenuItem'
import HasSubmenu from './mixins/HasSubmenu'

export default {
    mixins: [MenuItem, HasSubmenu],
    data(){
        return {
            open: false
        }
    },
    computed: {
        togglerClass(){
            return this.open ? '' : 'vlTogglerClosed'
        },
        menuClass(){
            return this.$_classString([
                this.open ? '' : 'vlMenuClosed',
                this.$_data('dropdownPosition')
            ])
        }

    },
    methods:{
        toggle(){
            this.open = !this.open
        }
    }
}
</script>