import { database, storage } from '@/appwrite';
import { getTodosGroupedByColumn } from '@/lib/getTodosGroupedByColumn';
import uploadImage from '@/lib/uploadImage';
import {create} from 'zustand'
import {ID} from "appwrite"

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

    addTask: (todo: string, columnId: TypedColumn, image?: File | null) => void;
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

    addTask: async (todo: string, columnId: TypedColumn, image?: File | null) => {
        let file: Image | undefined;

        if(image){
            const fileUploaded = await uploadImage(image);
            if(fileUploaded){
                file = {
                    bucketId: fileUploaded.bucketId,
                    fileId: fileUploaded.$id,
                }
                console.log(JSON.stringify(file))
            }
        }

        const {$id} = await database.createDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
            ID.unique(),
            {
                Title: todo,
                Status: columnId,
                // include image if it exists
                ...(file && {image: JSON.stringify(file)}),
            },
        );

        set({newTaskInput: ""});

        set((state) => {
            const newColumns = new Map(state.board.columns);

            const newTodo: Todo = {
                $id,
                $createdAt: new Date().toISOString(),
                Title: todo,
                Status: columnId,
                // include image if it exists
                ...(file && {image: file}),
            }

            const column = newColumns.get(columnId);

            if(!column){
                newColumns.set(columnId, {
                    id: columnId,
                    todos: [newTodo],
                });
            }else{
                newColumns.get(columnId)?.todos.push(newTodo);
            }

            return{
                board:{ columns: newColumns}
            }
        })




    }

}))



