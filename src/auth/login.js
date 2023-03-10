const { CognitoIdentityProviderClient, AdminInitiateAuthCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { sendResponse, validateInput } = require("./../functions");

const cognito = new CognitoIdentityProviderClient();

const handler = async (event) =>  {
    try {
        const isValid = validateInput(event.body)
        if (!isValid)
            return sendResponse(400, { message: 'Invalid input' })

        const { email, password } = JSON.parse(event.body)
        const { user_pool_id, client_id } = process.env
        const authParams  = {
            AuthFlow: "ADMIN_NO_SRP_AUTH",
            UserPoolId: user_pool_id,
            ClientId: client_id,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        }
        // const response = await cognito.adminInitiateAuth(params).promise();

        const authCommand = new AdminInitiateAuthCommand(authParams);
        const authResponse = await cognito.send(authCommand);


        return sendResponse(200, { message: 'Success', token: authResponse.AuthenticationResult.IdToken })
    }
    catch (error) {
        const message = error.message ? error.message : 'Internal server error'
        return sendResponse(500, { message })
    }
}

module.exports = {
    handler
};
  