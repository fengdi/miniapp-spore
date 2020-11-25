import { Store } from "miniapp-spore";


const store = new Store('$global', {
  todoList: [
    {
      title:"todo task",
      status: 1
    },
    {
      title:"coding",
      status: 0
    },
    {
      title:"shoping",
      status: 1
    }
  ]
})


const actions = {

  add(task){
    store.$spliceData({
      'todoList': [
        store.data.todoList.length, 0, task
      ]
    })
  },

  remove(index){
    store.$spliceData({
      'todoList': [
        index, 1
      ]
    })
  },

  switchStatus(index){
    let todoList = store.data.todoList;
    if(todoList[index]){
      store.setData({
        [`todoList[${index}].status`] : !todoList[index].status
      })
    }
  }

}


App({
  store,
  actions
});
