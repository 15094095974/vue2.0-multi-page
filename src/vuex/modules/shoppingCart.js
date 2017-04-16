import store from '../store'
import * as types from '../mutation-types'
import {Common, Vue} from 'js/base'
import api from '../api'
const buyBtnFont = {go: '去结算', delete: '删除'}
const state = {
    shoppingCartCheckbox: false,
    shoppingList: [],
    hasMore: true,
    currentPage: 0,
    totalPrice: 0,
    buyBtnDisabled: true,
    buyBtnCurrentFont: buyBtnFont.go,
    priceShow: {visibility: 'visible'},
    checkAll: false,
    itemChecked: [],
    isDelete: false,
    deleteIDs: []
}

const actions = {
    getShoppingCartList: function ({commit}) {
        if (state.hasMore) {
            commit(types.SHOPPINGCART_LIST_CURRENTPAGE);
            return api.getShoppingCartList(state.currentPage, function (res) {
                commit(types.SHOPPINGCART_GET_LIST, res)
            })
        }
    },
    deleteShoppingCartList: function ({commit, state}) {
        commit(types.SHOPPINGCART_DELETE_ARRAY);
        api.deleteShoppingCartList(state.deleteIDs, function (res) {
            commit(types.SHOPPINGCART_DELETE_SELECT, res);
        })
    }
}
const getters = {
    getShoppingList: state => state.shoppingList,
    shoppingCartHasMore: state => state.hasMore
}

const mutations = {
    [types.SHOPPINGCART_DELETE_ARRAY] (state) {
        let len = state.shoppingList.length
        let deleteID = []
        // 找出checked为true的数组
        let filter = state.shoppingList.filter(function (item, index, array) {
            return item.checked === true
        })
        filter.forEach(function (item, index, array) {
            deleteID.push(item.id)
        })
        state.deleteIDs = deleteID
    },
    [types.SHOPPINGCART_DELETE_SELECT] (state, res) {
    },
    [types.SHOPPINGCART_SELECT_ITEM] (state, id) {
        var len = state.shoppingList.length
        var index = state.shoppingList.findIndex(_item => _item.id === id)
        if (index > -1) {
            state.shoppingList[index]['checked'] = !state.shoppingList[index]['checked']
        }
        // 是否全部选中
        var isAllSelected = state.shoppingList.every(function (item, index) {
            return item.checked;
        })
        state.checkAll = isAllSelected === true;
        // 有一个被选中
        var oneSelected = state.shoppingList.some(function (item, index) {
            return item.checked;
        });
        state.buyBtnDisabled = oneSelected === false;
    },
    [types.SHOPPINGCART_SELECT_ALL] (state) {
        state.shoppingList.forEach(function (item) {
            item.checked = !state.checkAll;
        });
        state.checkAll = !state.checkAll;
        // 没有一个被选中
        state.buyBtnDisabled = state.checkAll === false;
    },
    [types.SHOPPINGCART_GET_LIST] (state, res) {
        res.cart_list.forEach(function (item, index, array) {
            item['checked'] = false // 为每个返回的数据加上一个checked标志
        })
        state.shoppingList = state.shoppingList.concat(res.cart_list)
        state.hasMore = state.currentPage < Common.index2PageCount(res.total_index) === true
    },
    [types.SHOPPINGCART_LIST_CURRENTPAGE] (state) {
        state.currentPage += 1
        state.hasMore = false
    },
    [types.SHOW_CHECKBOX] (state) {
        store.commit('TOP_RIGHT_CLICK_FONT', {afterFont: '完成'})
        if (state.shoppingCartCheckbox) {
            state.shoppingCartCheckbox = false
            state.priceShow = {visibility: 'visible'}
            state.buyBtnDisabled = true
            state.buyBtnCurrentFont = buyBtnFont.go
            state.isDelete = false
        } else {
            state.shoppingCartCheckbox = true
            state.priceShow = {visibility: 'hidden'}
            state.buyBtnDisabled = false
            state.buyBtnCurrentFont = buyBtnFont.delete
            state.isDelete = true
        }
    }
}

export default {
    state,
    actions,
    getters,
    mutations
}
