const console = require('console');
const xhr = require('xhr');
const store = require('kvstore');
const query = require('codec/query_string');
const auth = require('codec/auth');

export default (request) => {
    // watson api token
    const username = '00000000-0000-0000-0000-000000000000';
    const password = '000000000000';
    const apiUrl =
        'https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize';
    // token url
    const tokenUrl = 'https://stream.watsonplatform.net/authorization/api/v1/token?url=https://stream.watsonplatform.net/text-to-speech/api';

    return store.get('watson_token').then((watsonToken) => {
        watsonToken = watsonToken || { token: null, timestamp: null };
        let response = request.ok();

        if (watsonToken.token === null ||
                (Date.now() - watsonToken.timestamp) > 3000000) {
            const httpOptions = {
                as: 'json',
                headers: {
                    Authorization: auth.basic(username, password)
                }
            };

            response = xhr.fetch(tokenUrl, httpOptions).then(r => {
                watsonToken.token = decodeURIComponent(r.body);
                watsonToken.timestamp = Date.now();
                store.set('watson_token', watsonToken);
                if (watsonToken.token) {
                    const queryParams = {
                        accept: 'audio/wav',
                        voice: 'en-US_AllisonVoice',
                        text: request.message.text,
                        'watson-token': watsonToken.token
                    };

                    request.message.speech = apiUrl + '?' + query.stringify(queryParams);
                }
                return request.ok();
            },
            e => console.error(e.body))
            .catch((e) => console.error(e));
        } else {
            const queryParams = {
                accept: 'audio/wav',
                voice: 'en-US_AllisonVoice',
                text: request.message.text,
                'watson-token': watsonToken.token
            };

            request.message.speech = apiUrl + '?' + query.stringify(queryParams);
        }

        return response;
    });
};
