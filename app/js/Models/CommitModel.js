/**
 * Created by zauri_000 on 13.09.2015.
 */

/**
 * @class CommitModel
 * @type {Function}
 */
module.exports = {
    CommitModel: (function(){
        function CommitModel(options){
            options || (options = {});

            this.id = options.id;
            this.short_id = options.short_id;
            this.title = options.title;
            this.author_name = options.author_name;
            this.author_email = options.author_email;
            this.created_at = options.created_at;
            this.message = options.message;
            this.committed_date = options.committed_date;
            this.authored_date = options.authored_date;
            this.parent_ids = options.parent_ids || [];
        }

        return CommitModel;
    })()
};