import { ID } from "appwrite";
import { storage } from "@/appwrite";

const uploadImage = async (file: File) => {
    if(!file) return;

    const fileUploaded = await storage.createFile(
        "64738598585d3f791ce8",
        ID.unique(),
        file
    );
    
    return fileUploaded;
}

export default uploadImage;