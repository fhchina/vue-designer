import { shallowMount, Wrapper } from '@vue/test-utils'
import StyleInformation from '@/view/components/StyleInformation.vue'
import { STRuleForPrint } from '@/parser/style/types'

describe('StyleInformation', () => {
  describe('moving focus', () => {
    const StyleDeclaration = {
      name: 'StyleDeclaration',
      props: ['prop', 'value', 'autoFocus'],
      render(this: any, h: Function) {
        return h('div', {
          attrs: {
            styleDeclarationStub: true,
            prop: this.prop,
            value: this.value,
            autoFocus: this.autoFocus
          }
        })
      }
    }

    const rules: STRuleForPrint[] = [
      {
        path: [0],
        selectors: ['a'],
        children: [
          {
            path: [0, 0],
            prop: 'color',
            value: 'red'
          },
          {
            path: [0, 1],
            prop: 'font-size',
            value: '22px'
          }
        ]
      }
    ]

    const create = () => {
      return shallowMount(StyleInformation, {
        propsData: {
          rules
        },
        stubs: {
          StyleDeclaration
        }
      })
    }

    const toDeclarationHtml = (wrapper: Wrapper<any>) => {
      return wrapper
        .findAll(StyleDeclaration)
        .wrappers.map(w => w.html())
        .join('\n')
    }

    it('does not move focus if editing is ended by blur', () => {
      const wrapper = create()
      wrapper
        .findAll(StyleDeclaration)
        .at(0)
        .vm.$emit('input-end:prop', { reason: 'blur' })

      expect(toDeclarationHtml(wrapper)).toMatchSnapshot()
    })

    it('moves from prop to value', () => {
      const wrapper = create()
      wrapper
        .findAll(StyleDeclaration)
        .at(0)
        .vm.$emit('input-end:prop', { reason: 'enter' })

      expect(toDeclarationHtml(wrapper)).toMatchSnapshot()
    })

    it('moves from value to next prop value', () => {
      const wrapper = create()
      wrapper
        .findAll(StyleDeclaration)
        .at(0)
        .vm.$emit('input-end:value', { reason: 'enter' })

      expect(toDeclarationHtml(wrapper)).toMatchSnapshot()
    })

    it('adds a new declaration and moves focus to it', () => {
      const wrapper = create()
      wrapper
        .findAll(StyleDeclaration)
        .at(1)
        .vm.$emit('input-end:value', { reason: 'enter' })

      expect(wrapper.emitted('add-declaration')[0][0]).toEqual({
        path: [0, 2]
      })

      wrapper.setProps({
        rules: [
          {
            ...rules[0],
            children: [
              ...rules[0].children,
              {
                path: [0, 2],
                prop: 'property',
                value: 'value'
              }
            ]
          }
        ]
      })

      expect(toDeclarationHtml(wrapper)).toMatchSnapshot()
    })
  })
})