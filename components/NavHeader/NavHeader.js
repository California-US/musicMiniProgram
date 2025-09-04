Component({
  properties: {
    title: {
      type: String,
      value: 'title默认值'
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    getMore() {
      this.triggerEvent('getMore')
    }
  }
})
