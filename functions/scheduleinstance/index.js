// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START functions_start_instance_pubsub]
// [START functions_stop_instance_pubsub]
const Compute = require('@google-cloud/compute');
const compute = new Compute();
// [END functions_stop_instance_pubsub]

/**
 * Starts Compute Engine instances.
 *
 * Expects a PubSub message with JSON-formatted event data containing the
 * following attributes:
 *  zone - the GCP zone the instances are located in.
 *  label - the label of instances to start.
 *
 * @param {!object} event Cloud Function PubSub message event.
 * @param {!object} callback Cloud Function PubSub callback indicating
 *  completion.
 */
exports.startInstancePubSub = async (event, context, callback) => {
  try {
    const payload = JSON.parse(Buffer.from(event.data, 'base64').toString());
    const options = payload.label ? { filter: `labels.${payload.label}` } : {};
    let [vms] = await compute.getVMs(options);
    if (payload.zone) {
      vms = vms.filter(instance => instance.zone.id === payload.zone);
    }
    await Promise.all(
      vms.map(async (instance) => {
        const [operation] = await compute
          .zone(instance.zone.id)
          .vm(instance.name)
          .start();

        // Operation pending
        return operation.promise();
      })
    );

    // Operation complete. Instance successfully started.
    const message = `Successfully started instance(s)`;
    console.log(message);
    callback(null, message);
  } catch (err) {
    console.log(err);
    callback(err);
  }
};
// [END functions_start_instance_pubsub]
// [START functions_stop_instance_pubsub]

/**
 * Stops Compute Engine instances.
 *
 * Expects a PubSub message with JSON-formatted event data containing the
 * following attributes:
 *  zone - the GCP zone the instances are located in.
 *  label - the label of instances to stop.
 *
 * @param {!object} event Cloud Function PubSub message event.
 * @param {!object} callback Cloud Function PubSub callback indicating completion.
 */
exports.stopInstancePubSub = async (event, context, callback) => {
  try {
    const payload = JSON.parse(Buffer.from(event.data, 'base64').toString());
    const options = payload.label ? { filter: `labels.${payload.label}` } : {};
    let [vms] = await compute.getVMs(options);
    if (payload.zone) {
      vms = vms.filter(instance => instance.zone.id === payload.zone);
    }
    await Promise.all(
      vms.map(async (instance) => {
        const [operation] = await compute
          .zone(instance.zone.id)
          .vm(instance.name)
          .stop();

        // Operation pending
        return operation.promise();
      })
    );

    // Operation complete. Instance successfully stopped.
    const message = `Successfully stopped instance(s)`;
    console.log(message);
    callback(null, message);
  } catch (err) {
    console.log(err);
    callback(err);
  }
};
// [END functions_stop_instance_pubsub]
