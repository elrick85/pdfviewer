/**
 * Created by Zaur_Ismailov on 9/11/2015.
 */

/**
 * @class FileModel
 * @type {Function}
 */
module.exports = {
    FileModel: (function(){
        function FileModel(code, options){
            options || (options = {});

            this.code = code || "";
            this.blobId = options.blob_id;
            this.commitId = options.commit_id;
            this.content = options.content;
            this.encoding = options.encoding;
            this.fileName = options.file_name;
            this.filePath = options.file_path;
            this.ref = options.ref;
            this.size = options.size;
        }

        return FileModel;
    })()
};