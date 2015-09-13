/**
 * Created by Zaur_Ismailov on 9/11/2015.
 */

/**
 * @class FileModel
 * @type {Function}
 */
module.exports = {
    FileModel: (function () {
        function FileModel(code, options) {
            options || (options = {});

            this.code = code || "";
            this.file = {};
            this.commit = options.commit;
            this.user = options.user;

            this.file.blobId = options.file.blob_id;
            this.file.commitId = options.file.commit_id;
            this.file.content = options.file.content;
            this.file.encoding = options.file.encoding;
            this.file.fileName = options.file.file_name;
            this.file.filePath = options.file.file_path;
            this.file.ref = options.file.ref;
            this.file.size = options.file.size;
        }

        return FileModel;
    })()
};