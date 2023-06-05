import { database, storage } from '@/appwrite';
import { getTodosGroupedByColumn } from '@/lib/getTodosGroupedByColumn';
import {create} from 'zustand'

interface BoardState{
    board: Board;
    getBoard: () => void;
    setBoardState: (board: Board) => void;
    updateTodoInDB: (todo: Todo, columnId: TypedColumn) => void;
    newTaskInput: string;
    setNewTaskInput: (input: string) => void;

    searchString: string;
    setSearchString: (searchString: string) => void;

    deleteTask: (taskIndex: number, todoId: Todo, id: TypedColumn) => void;

    newTaskType: TypedColumn;
    setNewTaskType: (columnId: TypedColumn) => void;

    image: File | null;
    setImage: (image: File | null) => void;
}



export const useBoardStore = create<BoardState>((set, get) => ({

    newTaskType: "todo",
    setNewTaskType: (input: TypedColumn) => {set({newTaskType: input})},
    board:{
        columns: new Map<TypedColumn, Column>()
    },
    searchString: "",
    newTaskInput: "",
    image: null,
    setImage: (image: File | null) => set({image}),
    setNewTaskInput: (input: string) => {
        set({newTaskInput: input});
    },
    setSearchString: (searchString) => set({searchString}),
    getBoard: async() => {
        const board = await getTodosGroupedByColumn();
        set({ board });
    },
    setBoardState: (board) => set({board}),
    deleteTask: async (taskIndex: number, todo: Todo, id: TypedColumn) => {
        const newColumns = new Map(get().board.columns);

        newColumns.get(id)?.todos.splice(taskIndex, 1);

        set({board: {columns: newColumns}});

        console.log(todo.image);

        if(todo.image){
            await storage.deleteFile(todo.image.bucketId, todo.image.fileId);
        }

        await database.deleteDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
            todo.$id,
        )


    },
    updateTodoInDB: async (todo, columnId) => {
        await database.updateDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
            todo.$id,
            {
                Title: todo.Title,
                Status: columnId
            }
        )
    },

}))



