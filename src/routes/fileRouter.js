const express = require("express")
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob")
const multer = require("multer")

const router = express.Router()
const credentials = new StorageSharedKeyCredential("striveliveoct19", process.env.AZURE_STORAGE_KEY)
const blobClient = new BlobServiceClient("https://striveliveoct19.blob.core.windows.net/",  credentials)


router.get("/", async (req, res)=>{
    const containers = await blobClient.listContainers()
    const toReturn = []
    for await (const container of containers){
        console.log(container.name)
        toReturn.push(container.name)
    }
    res.send(toReturn)
})

router.get("/:containerName", async (req, res)=>{
    try{
        
        const container = await blobClient.getContainerClient(req.params.containerName)
        const files = container.listBlobsFlat()
        const toReturn = []
        for await (const file of files){
            console.log(file)
            toReturn.push(file.name)
        }
        res.send(toReturn)
    
    }
    catch(exx){
        console.log(exx)
        res.status(500).send(exx)
    }
})

router.post("/:containerName", async(req, res)=>{
    const container = await blobClient.createContainer(req.params.containerName, { access: "container" })
    res.send(container)
})

const multerOptions= new multer({})
router.post("/:containerName/upload", multerOptions.single("file"), async(req, res) => {
    console.log(req.file)
    try{
        const container = await blobClient.getContainerClient(req.params.containerName)
        const file = await container.uploadBlockBlob(req.file.originalname, req.file.buffer, req.file.size)
        res.send(file)
    
    }
    catch(exx)
    {
        console.log(exx)
        res.status(500).send(exx)
    }
})

router.delete("/:containerName/delete/:filename", async (req, res)=>{
    try{
        const container = await blobClient.getContainerClient(req.params.containerName)
        container.deleteBlob(req.params.filename)
        res.send("OK")
    }
    catch(exx)
    {
        console.log(exx)
        res.status(500).send(exx)
    }
})

module.exports = router