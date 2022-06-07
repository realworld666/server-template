import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config();

const stackName = pulumi.getStack();
const serviceName = `${config.name}-${stackName}`;

const bucket = new gcp.storage.Bucket(`${serviceName}-code-bucket`, {
    location: "EUROPE-WEST1",
    project: gcp.config.project
});

const object = new gcp.storage.BucketObject(`${serviceName}-${(new Date()).getTime()}`,{
    bucket: bucket.name,
    name: `${serviceName}-${(new Date()).getTime()}.zip`,
    source: new pulumi.asset.FileArchive("../server/dist"),
});

const myappV1 = new gcp.appengine.StandardAppVersion(`${serviceName}-backend`, {
    versionId: "v1",
    service: "default",
    runtime: "nodejs16",
    entrypoint: {
        shell: "node ./src/app-engine.js",
    },
    deployment: {
        zip: {
            sourceUrl: pulumi.interpolate`https://storage.googleapis.com/${bucket.name}/${object.name}`,
        },
    },
    envVariables: {
        port: "8080",
    },
    basicScaling: {
        maxInstances: 2,
        idleTimeout: "30s",
    },
    noopOnDestroy: true,
});