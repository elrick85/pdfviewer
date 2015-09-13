/**
 * Created by zauri_000 on 13.09.2015.
 */

/**
 * @class UserModel
 * @type {Function}
 */
module.exports = {
    UserModel: (function(){
        function UserModel(options){
            options || (options = {});

            this.id = options.id;
            this.username = options.username;
            this.name = options.name;
            this.state = options.state;
            this.avatar_url = options.avatar_url;
        }

        return UserModel;
    })()
};