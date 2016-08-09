// Generated by typings
// Source: https://raw.githubusercontent.com/tracktunes/ionic-recorder/master/typings/globals/waa/index.d.ts
declare var AudioContext: {
    new (): AudioContext;
    prototype: AudioContext;
}

declare var webkitAudioContext: {
    new (): webkitAudioContext;
    prototype: webkitAudioContext;
}

declare var webkitOfflineAudioContext: {
    new (numberOfChannels: number, length: number, sampleRate: number): OfflineAudioContext;
}

declare enum ChannelCountMode {
    'max',
    'clamped-max',
    'explicit'
}

declare enum ChannelInterpretation {
    speakers,
    discrete
}

declare enum PanningModelType {
    /**
     * A simple and efficient spatialization algorithm using
     * equal-power panning.
     */
    equalpower,

    /**
     * A higher quality spatialization algorithm using a convolution
     * with measured impulse responses from human subjects. This
     * panning method renders stereo output.
     */
    HRTF
}

declare enum DistanceModelType {
    /**
     * A linear distance model which calculates distanceGain according to: 
     *     1 - rolloffFactor * (distance - refDistance) / (maxDistance - refDistance)
     */
    linear,

    /**
     * An inverse distance model which calculates distanceGain according to: 
     *     refDistance / (refDistance + rolloffFactor * (distance - refDistance))
     */
    inverse,

    /**
     * An exponential distance model which calculates distanceGain according to: 
     *     pow(distance / refDistance, -rolloffFactor)
     */
    exponential
}

declare enum BiquadFilterType {
    /**
     * A lowpass filter allows frequencies below the cutoff frequency to pass through and attenuates frequencies above the cutoff. It implements a standard second-order resonant lowpass filter with 12dB/octave rolloff.
     *
     * ## frequency
     * The cutoff frequency
     * ## Q
     * Controls how peaked the response will be at the cutoff frequency. A large value makes the response more peaked. Please note that for this filter type, this value is not a traditional Q, but is a resonance value in decibels.
     * ## gain
     * Not used in this filter type
     */
    lowpass,

    /**
     * A highpass filter is the opposite of a lowpass filter. Frequencies above the cutoff frequency are passed through, but frequencies below the cutoff are attenuated. It implements a standard second-order resonant highpass filter with 12dB/octave rolloff.
     *
     * ## frequency
     * The cutoff frequency below which the frequencies are attenuated
     * ## Q
     * Controls how peaked the response will be at the cutoff frequency. A large value makes the response more peaked. Please note that for this filter type, this value is not a traditional Q, but is a resonance value in decibels.
     * ## gain
     * Not used in this filter type
     */
    highpass,

    /**
     * A bandpass filter allows a range of frequencies to pass through and attenuates the frequencies below and above this frequency range. It implements a second-order bandpass filter.
     *
     * ## frequency
     * The center of the frequency band
     * ## Q
     * Controls the width of the band. The width becomes narrower as the Q value increases.
     * ## gain
     * Not used in this filter type
     */
    bandpass,

    /**
     * The lowshelf filter allows all frequencies through, but adds a boost (or attenuation) to the lower frequencies. It implements a second-order lowshelf filter.
     *
     * ## frequency
     * The upper limit of the frequences where the boost (or attenuation) is applied.
     * ## Q
     * Not used in this filter type.
     * ## gain
     * The boost, in dB, to be applied. If the value is negative, the frequencies are attenuated.
     */
    lowshelf,

    /**
     * The highshelf filter is the opposite of the lowshelf filter and allows all frequencies through, but adds a boost to the higher frequencies. It implements a second-order highshelf filter
     *
     * ## frequency
     * The lower limit of the frequences where the boost (or attenuation) is applied.
     * ## Q
     * Not used in this filter type.
     * ## gain
     * The boost, in dB, to be applied. If the value is negative, the frequencies are attenuated.
     */
    highshelf,

    /**
     * The peaking filter allows all frequencies through, but adds a boost (or attenuation) to a range of frequencies.
     *
     * ## frequency
     * The center frequency of where the boost is applied.
     * ## Q
     * Controls the width of the band of frequencies that are boosted. A large value implies a narrow width.
     * ## gain
     * The boost, in dB, to be applied. If the value is negative, the frequencies are attenuated.
     */
    peaking,

    /**
     * The notch filter (also known as a band-stop or band-rejection filter) is the opposite of a bandpass filter. It allows all frequencies through, except for a set of frequencies.
     *
     * ## frequency
     * The center frequency of where the notch is applied.
     * ## Q
     * Controls the width of the band of frequencies that are attenuated. A large value implies a narrow width.
     * ## gain
     * Not used in this filter type.
     */
    notch,

    /**
     * An allpass filter allows all frequencies through, but changes the phase relationship between the various frequencies. It implements a second-order allpass filter
     *
     * ## frequency
     * The frequency where the center of the phase transition occurs. Viewed another way, this is the frequency with maximal group delay.
     * ## Q
     * Controls how sharp the phase transition is at the center frequency. A larger value implies a sharper transition and a larger group delay.
     * ## gain
     * Not used in this filter type.
     */
    allpass
}

declare enum OverSampleType {
    'none',
    '2x',
    '4x'
}

declare enum OscillatorType {
    sine,
    square,
    sawtooth,
    triangle,
    custom
}

interface AudioContextConstructor {
    new (): AudioContext;
}

interface webkitAudioContextConstructor {
    new (): webkitAudioContext;
}

interface Window {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: webkitAudioContextConstructor;
}

interface AudioContext {
    createMediaStreamSource(stream: MediaStream): MediaStreamAudioSourceNode;
    createMediaStreamDestination(): MediaStreamAudioDestinationNode;
    createAnalyzer(stream: MediaStream): AnalyserNode;
}

interface MediaStreamAudioSourceNode extends AudioNode {
}

interface MediaStreamAudioDestinationNode extends AudioDestinationNode
{
	stream: MediaStream; //  readonly
}

interface AudioBuffer {
    copyFromChannel(destination: Float32Array, channelNumber: number, startInChannel?: number): void;
    copyToChannel(source: Float32Array, channelNumber: number, startInChannel?: number): void;
}

interface AudioNode {
    disconnect(destination: AudioNode): void;
}

interface Gain {
    value: number;
}

interface AudioGainNode extends AudioNode {
    gain: Gain;
}

interface AudioContext {
    suspend(): Promise<void>;
    resume(): Promise<void>;
    close(): Promise<void>;
    createGain(): AudioGainNode;
}

interface webkitAudioContext extends AudioContext {
}


interface MediaRecorder {
    start(): void;
    pause(): void;
    resume(): void;
    stop(): void;
    
    state: any;

    // ondataavailable: MediaRecorderCallbackType;
    ondataavailable(event: BlobEvent): void;
    onstop(event: Event): void;
}

interface MediaRecorderOptions {
    mimeType: string;
}

declare var MediaRecorder: {
    new (stream: MediaStream, options?: MediaRecorderOptions): MediaRecorder;
    prototype: MediaRecorder;

    isTypeSupported(type: string): boolean;
}

interface BlobEvent extends Event {
    data: Blob;
}

/*
 * MediaStream typings
 */

interface ConstrainBooleanParameters {
    exact?: boolean;
    ideal?: boolean;
}

interface NumberRange {
    max?: number;
    min?: number;
}

interface ConstrainNumberRange extends NumberRange {
    exact?: number;
    ideal?: number;
}

interface ConstrainStringParameters {
    exact?: string | string[];
    ideal?: string | string[];
}

interface MediaStreamConstraints {
    video?: boolean | MediaTrackConstraints;
    audio?: boolean | MediaTrackConstraints;
}

declare module W3C {
    type LongRange = NumberRange;
    type DoubleRange = NumberRange;
    type ConstrainBoolean = boolean | ConstrainBooleanParameters;
    type ConstrainNumber = number | ConstrainNumberRange;
    type ConstrainLong = ConstrainNumber;
    type ConstrainDouble = ConstrainNumber;
    type ConstrainString = string | string[] | ConstrainStringParameters;
}

interface MediaTrackConstraints extends MediaTrackConstraintSet {
    advanced?: MediaTrackConstraintSet[];
}

interface MediaTrackConstraintSet {
    width?: W3C.ConstrainLong;
    height?: W3C.ConstrainLong;
    aspectRatio?: W3C.ConstrainDouble;
    frameRate?: W3C.ConstrainDouble;
    facingMode?: W3C.ConstrainString;
    volume?: W3C.ConstrainDouble;
    sampleRate?: W3C.ConstrainLong;
    sampleSize?: W3C.ConstrainLong;
    echoCancellation?: W3C.ConstrainBoolean;
    latency?: W3C.ConstrainDouble;
    deviceId?: W3C.ConstrainString;
    groupId?: W3C.ConstrainString;
}

interface MediaTrackSupportedConstraints {
    width?: boolean;
    height?: boolean;
    aspectRatio?: boolean;
    frameRate?: boolean;
    facingMode?: boolean;
    volume?: boolean;
    sampleRate?: boolean;
    sampleSize?: boolean;
    echoCancellation?: boolean;
    latency?: boolean;
    deviceId?: boolean;
    groupId?: boolean;
}

interface MediaStream extends EventTarget {
    id: string;
    active: boolean;

    onactive: EventListener;
    oninactive: EventListener;
    onaddtrack: (event: MediaStreamTrackEvent) => any;
    onremovetrack: (event: MediaStreamTrackEvent) => any;

    clone(): MediaStream;
    stop(): void;

    getAudioTracks(): MediaStreamTrack[];
    getVideoTracks(): MediaStreamTrack[];
    getTracks(): MediaStreamTrack[];

    getTrackById(trackId: string): MediaStreamTrack;

    addTrack(track: MediaStreamTrack): void;
    removeTrack(track: MediaStreamTrack): void;
}

interface MediaStreamTrackEvent extends Event {
    track: MediaStreamTrack;
}

declare enum MediaStreamTrackState {
	"live",
    "ended"
}

interface MediaStreamTrack extends EventTarget {
    id: string;
    kind: string;
    label: string;
    enabled: boolean;
    muted: boolean;
    remote: boolean;
    readyState: MediaStreamTrackState;

    onmute: EventListener;
    onunmute: EventListener;
    onended: EventListener;
    onoverconstrained: EventListener;

    clone(): MediaStreamTrack;

    stop(): void;

    getCapabilities(): MediaTrackCapabilities;
    getConstraints(): MediaTrackConstraints;
    getSettings(): MediaTrackSettings;
    applyConstraints(constraints: MediaTrackConstraints): Promise<void>;
}

interface MediaTrackCapabilities {
    width: number | W3C.LongRange;
    height: number | W3C.LongRange;
    aspectRatio: number | W3C.DoubleRange;
    frameRate: number | W3C.DoubleRange;
    facingMode: string;
    volume: number | W3C.DoubleRange;
    sampleRate: number | W3C.LongRange;
    sampleSize: number | W3C.LongRange;
    echoCancellation: boolean[];
    latency: number | W3C.DoubleRange;
    deviceId: string;
    groupId: string;
}

interface MediaTrackSettings {
    width: number;
    height: number;
    aspectRatio: number;
    frameRate: number;
    facingMode: string;
    volume: number;
    sampleRate: number;
    sampleSize: number;
    echoCancellation: boolean;
    latency: number;
    deviceId: string;
    groupId: string;
}

interface MediaStreamError {
    name: string;
    message: string;
    constraintName: string;
}

interface NavigatorGetUserMedia {
    (constraints: MediaStreamConstraints,
     successCallback: (stream: MediaStream) => void,
     errorCallback: (error: MediaStreamError) => void): void;
}

// to use with adapter.js, see: https://github.com/webrtc/adapter
declare var getUserMedia: NavigatorGetUserMedia;

interface Navigator {
    getUserMedia: NavigatorGetUserMedia;

    webkitGetUserMedia: NavigatorGetUserMedia;

    mozGetUserMedia: NavigatorGetUserMedia;

    msGetUserMedia: NavigatorGetUserMedia;

    mediaDevices: MediaDevices;
}

interface MediaDevices {
    getSupportedConstraints(): MediaTrackSupportedConstraints;

    getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
    enumerateDevices(): Promise<MediaDeviceInfo[]>;
}

interface MediaDeviceInfo {
    label: string;
    id: string;
    kind: string;
    facing: string;
}