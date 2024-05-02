import { Component, OnInit } from '@angular/core';
import { CallClient, LocalVideoStream, VideoStreamRenderer } from '@azure/communication-calling';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Calling web sdk objects
  callAgent: any;
  deviceManager: any;
  call: any;
  incomingCall: any;
  localVideoStream: any;
  localVideoStreamRenderer: any;
  callState: string | undefined;

  // UI widgets
  userAccessToken = <HTMLInputElement>window.document.getElementById('user-access-token');
  calleeAcsUserId = <HTMLInputElement>document.getElementById('callee-acs-user-id');
  initializeCallAgentButton = <HTMLInputElement>document.getElementById('initialize-call-agent');
  startCallButton = <HTMLInputElement>document.getElementById('start-call-button');
  hangUpCallButton = <HTMLInputElement>document.getElementById('hangup-call-button');
  acceptCallButton = <HTMLInputElement>document.getElementById('accept-call-button');
  startVideoButton = <HTMLInputElement>document.getElementById('start-video-button');
  stopVideoButton = <HTMLInputElement>document.getElementById('stop-video-button');
  connectedLabel = <HTMLInputElement>document.getElementById('connectedLabel');
  remoteVideosGallery = <HTMLInputElement>document.getElementById('remoteVideosGallery');
  localVideoContainer = <HTMLInputElement>document.getElementById('localVideoContainer');

  mydata1: any =0;
  mydata2: any =1;
  originalVal1 = 0;
  originalVal2 = 1;

  constructor() { }

  onValueChange(e: any){
    console.log('hi::', e);
    if(this.mydata1 > this.mydata2){
      // const temp = this.mydata1;
      this.mydata1 =  this.originalVal1;
      this.mydata2 =  this.originalVal2;
    }
  }

  ngOnInit() {
    this.userAccessToken = <HTMLInputElement>window.document.getElementById('user-access-token');
    this.calleeAcsUserId = <HTMLInputElement>document.getElementById('callee-acs-user-id');
    this.initializeCallAgentButton = <HTMLInputElement>document.getElementById('initialize-call-agent');
    this.startCallButton = <HTMLInputElement>document.getElementById('start-call-button');
    this.hangUpCallButton = <HTMLInputElement>document.getElementById('hangup-call-button');
    this.acceptCallButton = <HTMLInputElement>document.getElementById('accept-call-button');
    this.startVideoButton = <HTMLInputElement>document.getElementById('start-video-button');
    this.stopVideoButton = <HTMLInputElement>document.getElementById('stop-video-button');
    this.connectedLabel = <HTMLInputElement>document.getElementById('connectedLabel');
    this.remoteVideosGallery = <HTMLInputElement>document.getElementById('remoteVideosGallery');
    this.localVideoContainer = <HTMLInputElement>document.getElementById('localVideoContainer');
  }

  // Set the log level and output
  // setLogLevel('verbose');

  // AzureLogger.log = (...args) => {
  //     console.log(...args);
  // };

  hiThere() {
    console.log('clicked::', this.userAccessToken?.value);
  }

  /**
   * Using the CallClient, initialize a CallAgent instance with a CommunicationUserCredential which enable us to make outgoing calls and receive incoming calls. 
   * You can then use the CallClient.getDeviceManager() API instance to get the DeviceManager.
   */
  // initializeCallAgentButton.onclick = async () => {

  async initializeCallAgent() {
    try {
      const callClient = new CallClient();
      let tokenCredential = new AzureCommunicationTokenCredential(this.userAccessToken?.value.trim());
      this.callAgent = await callClient.createCallAgent(tokenCredential)
      // Set up a camera device to use.
      let deviceManager = await callClient.getDeviceManager();
      await deviceManager.askDevicePermission({ video: true, audio: false });
      await deviceManager.askDevicePermission({ audio: true, video: false });
      // Listen for an incoming call to accept.
      this.callAgent.on('incomingCall', async (args: any) => {
        try {
          this.incomingCall = args.incomingCall;
          this.acceptCallButton.disabled = false;
          this.startCallButton.disabled = true;
        } catch (error) {
          console.error(error);
        }
      });

      this.startCallButton.disabled = false;
      this.initializeCallAgentButton.disabled = true;
    } catch (error) {
      console.error(error);
    }
  }


  /**
   * Place a 1:1 outgoing video call to a user
   * Add an event listener to initiate a call when the `startCallButton` is clicked:
   * First you have to enumerate local cameras using the deviceManager `getCameraList` API.
   * In this quickstart we're using the first camera in the collection. Once the desired camera is selected, a
   * LocalVideoStream instance will be constructed and passed within `videoOptions` as an item within the
   * localVideoStream array to the call method. Once your call connects it will automatically start sending a video stream to the other participant. 
   */
  async startCall() {
    try {
      //const localVideoStream = await createLocalVideoStream();
      const videoOptions = this.localVideoStream ? { localVideoStreams: [this.localVideoStream] } : undefined;
      this.call = this.callAgent.startCall([{ communicationUserId: this.calleeAcsUserId.value.trim() }], { videoOptions });
      // Subscribe to the call's properties and events.
      this.subscribeToCall(this.call);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Accepting an incoming call with video
   * Add an event listener to accept a call when the `acceptCallButton` is clicked:
   * After subscribing to the `CallAgent.on('incomingCall')` event, you can accept the incoming call.
   * You can pass the local video stream which you want to use to accept the call with.
   */
  async acceptCall() {
    try {
      //const localVideoStream = await createLocalVideoStream();
      const videoOptions = this.localVideoStream ? { localVideoStreams: [this.localVideoStream] } : undefined;
      this.call = await this.incomingCall.accept({ videoOptions });
      // Subscribe to the call's properties and events.
      this.subscribeToCall(this.call);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Subscribe to a call obj.
   * Listen for property changes and collection updates.
   */
  subscribeToCall(call: any) {
    try {
      // Inspect the initial call.id value.
      console.log(`Call Id: ${call.id}`);
      //Subscribe to call's 'idChanged' event for value changes.
      call.on('idChanged', () => {
        console.log(`Call Id changed: ${call.id}`);
      });

      // Inspect the initial call.state value.
      console.log(`Call state: ${call.state}`);
      // Subscribe to call's 'stateChanged' event for value changes.
      call.on('stateChanged', async () => {
        console.log(`Call state changed: ${call.state}`);
        this.callState = call.state;
        if (call.state === 'Connected') {
          this.connectedLabel.hidden = false;
          this.acceptCallButton.disabled = true;
          this.startCallButton.disabled = true;
          this.hangUpCallButton.disabled = false;
          this.startVideoButton.disabled = false;
          this.stopVideoButton.disabled = false;
          this.remoteVideosGallery.hidden = false;
        } else if (call.state === 'Disconnected') {
          this.connectedLabel.hidden = true;
          this.startCallButton.disabled = false;
          this.hangUpCallButton.disabled = true;
          this.startVideoButton.disabled = true;
          this.stopVideoButton.disabled = true;
          console.log(`Call ended, call end reason={code=${call.callEndReason.code}, subCode=${call.callEndReason.subCode}}`);
        }
      });

      call.localVideoStreams.forEach(async (lvs: any) => {
        this.localVideoStream = lvs;
        await this.displayLocalVideoStream();
      });
      call.on('localVideoStreamsUpdated', (e: any) => {
        e.added.forEach(async (lvs: any) => {
          this.localVideoStream = lvs;
          await this.displayLocalVideoStream();
        });
        e.removed.forEach((lvs: any) => {
          this.removeLocalVideoStream();
        });
      });

      // Inspect the call's current remote participants and subscribe to them.
      call.remoteParticipants.forEach((remoteParticipant: any) => {
        this.subscribeToRemoteParticipant(remoteParticipant);
      });
      // Subscribe to the call's 'remoteParticipantsUpdated' event to be
      // notified when new participants are added to the call or removed from the call.
      call.on('remoteParticipantsUpdated', (e: any) => {
        // Subscribe to new remote participants that are added to the call.
        e.added.forEach((remoteParticipant: any) => {
          this.subscribeToRemoteParticipant(remoteParticipant)
        });
        // Unsubscribe from participants that are removed from the call
        e.removed.forEach((remoteParticipant: any) => {
          console.log('Remote participant removed from the call.');
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
 * Subscribe to a remote participant obj.
 * Listen for property changes and collection udpates.
 */
  subscribeToRemoteParticipant(remoteParticipant: any) {
    try {
      // Inspect the initial remoteParticipant.state value.
      console.log(`Remote participant state: ${remoteParticipant.state}`);
      // Subscribe to remoteParticipant's 'stateChanged' event for value changes.
      remoteParticipant.on('stateChanged', () => {
        console.log(`Remote participant state changed: ${remoteParticipant.state}`);
      });

      // Inspect the remoteParticipants's current videoStreams and subscribe to them.
      remoteParticipant.videoStreams.forEach((remoteVideoStream: any) => {
        this.subscribeToRemoteVideoStream(remoteVideoStream)
      });
      // Subscribe to the remoteParticipant's 'videoStreamsUpdated' event to be
      // notified when the remoteParticiapant adds new videoStreams and removes video streams.
      remoteParticipant.on('videoStreamsUpdated', (e: any) => {
        // Subscribe to new remote participant's video streams that were added.
        e.added.forEach((remoteVideoStream: any) => {
          this.subscribeToRemoteVideoStream(remoteVideoStream)
        });
        // Unsubscribe from remote participant's video streams that were removed.
        e.removed.forEach((remoteVideoStream: any) => {
          console.log('Remote participant video stream was removed.');
        })
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Subscribe to a remote participant's remote video stream obj.
   * You have to subscribe to the 'isAvailableChanged' event to render the remoteVideoStream. If the 'isAvailable' property
   * changes to 'true', a remote participant is sending a stream. Whenever availability of a remote stream changes
   * you can choose to destroy the whole 'Renderer', a specific 'RendererView' or keep them, but this will result in displaying blank video frame.
   */
  subscribeToRemoteVideoStream = async (remoteVideoStream: any) => {
    let renderer = new VideoStreamRenderer(remoteVideoStream);
    let view: any;
    let remoteVideoContainer = document.createElement('div');
    remoteVideoContainer.className = 'remote-video-container';

    let loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    remoteVideoStream.on('isReceivingChanged', () => {
      try {
        if (remoteVideoStream.isAvailable) {
          const isReceiving = remoteVideoStream.isReceiving;
          const isLoadingSpinnerActive = remoteVideoContainer.contains(loadingSpinner);
          if (!isReceiving && !isLoadingSpinnerActive) {
            remoteVideoContainer.appendChild(loadingSpinner);
          } else if (isReceiving && isLoadingSpinnerActive) {
            remoteVideoContainer.removeChild(loadingSpinner);
          }
        }
      } catch (e) {
        console.error(e);
      }
    });

    const createView = async () => {
      // Create a renderer view for the remote video stream.
      view = await renderer.createView();
      // Attach the renderer view to the UI.
      remoteVideoContainer.appendChild(view.target);
      this.remoteVideosGallery.appendChild(remoteVideoContainer);
    }

    // Remote participant has switched video on/off
    remoteVideoStream.on('isAvailableChanged', async () => {
      try {
        if (remoteVideoStream.isAvailable) {
          await createView();
        } else {
          view.dispose();
          this.remoteVideosGallery.removeChild(remoteVideoContainer);
        }
      } catch (e) {
        console.error(e);
      }
    });

    // Remote participant has video on initially.
    if (remoteVideoStream.isAvailable) {
      try {
        await createView();
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
  * Start your local video stream.
  * This will send your local video stream to remote participants so they can view it.
  */
  async startVideo() {
    try {
      const localVideoStream = await this.createLocalVideoStream();
      await this.call.startVideo(localVideoStream);
    } catch (error) {
      console.error(error);
    }
  }

  /**
  * Stop your local video stream.
  * This will stop your local video stream from being sent to remote participants.
  */
  async stopVideo() {
    try {
      await this.call.stopVideo(this.localVideoStream);
    } catch (error) {
      console.error(error);
    }
  }

  /**
  * To render a LocalVideoStream, you need to create a new instance of VideoStreamRenderer, and then
  * create a new VideoStreamRendererView instance using the asynchronous createView() method.
  * You may then attach view.target to any UI element. 
  */
  createLocalVideoStream = async () => {
    const camera = (await this.deviceManager.getCameras())[0];
    if (camera) {
      return new LocalVideoStream(camera);
    } else {
      console.error(`No camera device found on the system`);
    }
    return;
  }

  /**
  * Display your local video stream preview in your UI
  */
  displayLocalVideoStream = async () => {
    try {
      this.localVideoStreamRenderer = new VideoStreamRenderer(this.localVideoStream);
      const view = await this.localVideoStreamRenderer.createView();
      this.localVideoContainer.hidden = false;
      this.localVideoContainer.appendChild(view.target);
    } catch (error) {
      console.error(error);
    }
  }

  /**
  * Remove your local video stream preview from your UI
  */
  removeLocalVideoStream = async () => {
    try {
      this.localVideoStreamRenderer.dispose();
      this.localVideoContainer.hidden = true;
    } catch (error) {
      console.error(error);
    }
  }

  /**
  * End current call
  */
  async hangUpCall() {
    // end the current call
    await this.call.hangUp();
  }

}

