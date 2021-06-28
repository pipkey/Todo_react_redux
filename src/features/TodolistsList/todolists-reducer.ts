import {todolistsAPI, TodolistType} from "../../api/todolists-api"
import {Dispatch} from "redux"
import {RequestStatusType, setAppErrorAC, SetAppErrorType, setAppStatusAC, SetAppStatusType} from "../../app/appReducer"

const initialState: Array<TodolistDomainType> = []

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case "REMOVE-TODOLIST":
            return state.filter(tl => tl.id !== action.id)
        case "ADD-TODOLIST":
            return [{...action.todolist, filter: "all", entityStatus: "idle"}, ...state]
        case "CHANGE-TODOLIST-TITLE":
            return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
        case "CHANGE-TODOLIST-FILTER":
            return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
        case "CHANGE-TODOLIST-ENTITY":
            return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
        case "SET-TODOLISTS":
            return action.todolists.map(tl => ({...tl, filter: "all", entityStatus:"idle"}))
        default:
            return state
    }
};

// actions
export const removeTodolistAC = (id: string) => ({type: "REMOVE-TODOLIST", id} as const)
export const addTodolistAC = (todolist: TodolistType) => ({type: "ADD-TODOLIST", todolist} as const)
export const changeTodolistTitleAC = (id: string, title: string) => ({
    type: "CHANGE-TODOLIST-TITLE",
    id,
    title
} as const)

export const changeTodolistEntityAC = (id: string, entityStatus: FilterValuesType) => ({
    type: "CHANGE-TODOLIST-ENTITY",
    id,
    filter
} as const)
export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: "SET-TODOLISTS", todolists} as const)

// thunks
export const fetchTodolistsTC = () => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(setAppStatusAC("loading"));
        todolistsAPI.getTodolists()
            .then((res) => {

                dispatch(setAppStatusAC("idle"));
                dispatch(setTodolistsAC(res.data))
            })

    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(setAppStatusAC("loading"));
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(setAppStatusAC("idle"));
                dispatch(removeTodolistAC(todolistId))
            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(setAppStatusAC("loading"));
        todolistsAPI.createTodolist(title)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    dispatch(setAppStatusAC("succeeded"));
                    dispatch(addTodolistAC(res.data.data.item))
                } else {
                    if (res.data.messages.length){
                        dispatch(setAppErrorAC(res.data.messages[0]))
                    }else{
                        dispatch(setAppErrorAC("some error"));
                    }
                    dispatch(setAppStatusAC("succeeded"));
                }
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(setAppStatusAC("loading"));
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(setAppStatusAC("idle"));
                dispatch(changeTodolistTitleAC(id, title))
            })
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
export type ChangeEntityActionType = ReturnType<typeof changeTodolistEntityAC>;
type ActionsType =
    SetAppStatusType | SetAppErrorType| ChangeEntityActionType
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | SetTodolistsActionType
export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType

}
