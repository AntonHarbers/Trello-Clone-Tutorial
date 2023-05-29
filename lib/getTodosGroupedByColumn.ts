import { database } from "@/appwrite"
import { Databases } from "appwrite"

export const getTodosGroupedByColumn = async() => {
    const data = await database.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
    )

    const todos = data.documents;

    const columns = todos.reduce((acc, todo)=> {
        if(!acc.get(todo.Status)){
            acc.set(todo.Status, {
                id: todo.Status,
                todos: []
            })
        }

        acc.get(todo.Status)!.todos.push({
            $id: todo.$id,
            $createdAt: todo.$createdAt,
            Title: todo.Title,
            Status: todo.Status,
            ...(todo.image && {image: todo.image})
        })

        return acc;

    }, new Map<TypedColumn, Column>)


    const columnTypes: TypedColumn[] = ["todo", "inprogress", "done"];
    for(const columnType of columnTypes){
        if(!columns.get(columnType)){
            columns.set(columnType, {
                id: columnType,
                todos: [],
            })
        }
    }

    const sortedColumns = new Map(
        Array.from(columns.entries()).sort(
            (a,b) => columnTypes.indexOf(a[0]) - columnTypes.indexOf(b[0])
        )
    )

    const board:Board = {
        columns: sortedColumns
    }

    return board;

    
}