"use strict";


/* Get the privateKeyString from SecretsManager */
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
 import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
//import { getSignedUrl } from 'aws-cloudfront-sign';

export const getSecretValue = async (
  secretName = "plugrapid-prod-oac-pvt-key"
) => {
  const client = new SecretsManagerClient({ region: "us-east-1" });
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    })
  );
  console.log("Private key retrieved: " + response);
  if (response.SecretString) {
    return response.SecretString;
  }

  if (response.SecretBinary) {
    return response.SecretBinary;
  }
};

export const handler = async (event, context, callback) => {
  
  // * Check for sub-folder index.html .
  
  if (event.Records[0].cf.request.uri.endsWith('/')) {
    event.Records[0].cf.request.uri += 'index.html';
  }
  // Check whether the URI is missing a file extension.
  else if (!event.Records[0].cf.request.uri.includes('.')) {
    event.Records[0].cf.request.uri += '/index.html';
  } 

  const url = 'https://' + event.Records[0].cf.config.distributionDomainName + event.Records[0].cf.request.uri+'?'+event.Records[0].cf.request.querystring;
  
  console.log("URL: " + url);
  const privateKey = await getSecretValue(); // Await the getSecretValue function

  /* If you use getSignedUrl from 'aws-cloudfront-sign'
  const options = { keypairId: 'K238WIYVCTKUIP', privateKeyString: privateKey };
  const signedUrl = getSignedUrl(url, options);
  console.log('Signed URL: ' + signedUrl);
  */

  /* If you use cloudfront-signer library */
  const keyPairId = "K238WIYVCTKUIP";
  const dateLessThan = "2026-01-01"; // any Date constructor compatible

  const signedUrl = getSignedUrl({
    url,
    keyPairId,
    dateLessThan,
    privateKey,
  });

  console.log("Signed URL: " + signedUrl);
  
  
  event.Records[0].cf.request.uri = signedUrl.substring(36);
  callback(null,event.Records[0].cf.request);

};
  
/*
  const response = {
    status: "301",
    statusDescription: "Moved Permanently",
    headers: {
      "location": [
        {
          key: "Location",
          value: signedUrl,
        },
      ],
    },
  };
*/
  /*
  const response = event;
  
  response.Records[0].cf.request.uri=signedUrl.substring(36);
  response.Records[0].cf.config.eventType = "origin-request";
  
  const originObj= {
                s3: {
                  domainName: "plugrapid-webserver-root.s3.us-east-1.amazonaws.com",
                  path: "/",
                  authmethod: "origin-access-identity",
                  region: "us-east-1",
                }
  };
  response.Records[0].cf.origin= originObj;
  const responseObj = JSON.stringify(response);
  console.log(" Response back to cloudfront is: "+ responseObj);
  callback(null, responseObj);
};
*/

