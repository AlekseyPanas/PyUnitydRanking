// Given the DB pool, returns a pack of functions that manipulate accounts
module.exports = (pool) => {
    return {
        // Creates an account with provided data
        create_account: async (email, password_hash=null, display_name=null, profile_image_path=null) => {
            let accountID = (await pool.query(`
            INSERT INTO hub.hub_accounts (
                display_name, email, password_hash, profile_image_path
            ) VALUES (
                $1, $2, $3, $4
            ) RETURNING account_id;`, [display_name, email, password_hash, profile_image_path])).rows[0].account_id;

            return accountID;
        },

        // Gets account matching the ID (hopefully only 1 account comes up)
        get_account_by_id: async (account_id) => {
            let account = (await pool.query(`SELECT 
                                    account_id, display_name, email, password_hash, profile_image_path 
                                    FROM hub.hub_accounts WHERE account_id = $1;`, [account_id])).rows;

            return !!account.length ? account[0] : null;
        },

        // Gets account matching the ID (hopefully only 1 account comes up)
        get_account_by_email : async (email) => {
            let account = (await pool.query(`SELECT account_id, display_name, email, password_hash, profile_image_path 
                                            FROM hub.hub_accounts WHERE email = $1;`, [email])).rows
        
            return !!account.length ? account[0] : null;
        },

        // Checks if account has been finalized
        is_account_finalized: (account) => {
            return !!account.display_name && !!account.password_hash
        }
    }
}
