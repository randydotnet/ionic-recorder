// Copyright (c) 2017 Tracktunes Inc

// Lowest-level audio-buffer Web Audio Api playback class.
// This class only deals with a single audio-buffer, it
// knows nothing about multi-buffer streams or encodings.
// Plays for various encodings are in files with name player-X.ts
// (where 'X' is, e.g, 'wav' or 'webm') in play-wav.ts and are
// responsible for dealing with multiple-chunk files stored via indexedDB -
// these extension classes use this base class for single buffer operations.

import { Injectable } from '@angular/core';
import { formatTime, prependArray } from '../../models';
import { AUDIO_CONTEXT, Heartbeat } from '../../services';

/** @const {string} The name of the function we give to master clock to run */
const PLAYER_CLOCK_FUNCTION_NAME: string = 'player';

/**
 * Audio playback from an AudioBuffer (not from file, for playback from file,
 * see the classes that extend this one, e.g. wav-player.ts. Based on Web
 * Audio API. Originally this was based on code by Ian McGregor here:
 * http://codepen.io/ianmcgregor/pen/EjdJZZ
 *
 * @class WebAudioPlayer
 */
@Injectable()
export abstract class WebAudioPlayer {
    public isPlaying: boolean;
    // time is guaranteed to be Heartbeat interval
    public time: number;
    public duration: number;
    public displayTime: string;
    public displayDuration: string;
    public progress: number;

    protected sourceNode: AudioBufferSourceNode;
    protected startedAt: number;
    protected pausedAt: number;

    private heartbeat: Heartbeat;
    protected audioBuffer: AudioBuffer;
    private scheduledSourceNodes: AudioBufferSourceNode[];

    /**
     *
     */
    constructor(heartbeat: Heartbeat) {
        console.log('constructor()');
        this.heartbeat = heartbeat;
        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
        this.scheduledSourceNodes = [];
        this.time = 0;
        this.duration = 0;
        this.displayTime = formatTime(0, 0);
        this.displayDuration = this.displayTime;
        this.progress = 0;
    }

    /**
     * Abstract method
     */
    public abstract playFrom(position: number): void;

    /**
     * Abstract method
     */
    public abstract pauseAt(position: number): void;

    /**
     * Ensures change detection every GRAPHICS_REFRESH_INTERVAL
     */
    public startMonitoring(): void {
        console.log('startMonitoring()');
        this.heartbeat.addFunction(
            PLAYER_CLOCK_FUNCTION_NAME,
            // the monitoring actions are in the following function:
            () => {
                // console.log('.p.');
                let time: number = this.getTime();

                if (this.duration <= 0) {
                    alert('this.duration <= 0');
                }

                console.log(time.toFixed(2) + ', ' + this.duration.toFixed(2));
                if (time > this.duration) {
                    time = this.duration;
                    this.stop();
                    const msg: string = 'time (' + time.toFixed(2) +
                          ') > this.duration (' + this.duration.toFixed(2) +
                          ') delta: ' + (time - this.duration) * 1000000000.0;
                    console.log(msg);
                    // alert(msg);
                }

                if (this.time !== time) {
                    // change detected
                    this.time = time;
                    this.progress = time / this.duration;
                    this.displayTime = formatTime(time, this.duration);

                    console.log('time change! ' + this.progress.toFixed(2));

                    // console.log(this.progress);
                    // console.log('this.time !== time\n' + this.time + '\n' +
                    //             time + '\n' + this.displayTime);
                }
            }
        );
    }

    /**
     * Ensure source node stops playback. This does the reset part (stopping
     * playback) only as far as AudioBufferSourceNode is concerned, not fully
     * resetting everything in this function, for that see this.stop(), which
     * calls this function.
     */
    public stopMonitoring(): void {
        console.log('stopMonitoring()');
        setTimeout(
            () => {
                this.heartbeat.removeFunction(PLAYER_CLOCK_FUNCTION_NAME);
            });
    }

    /**
     * Ensure source node stops playback. This does the reset part (stopping
     * playback) only as far as AudioBufferSourceNode is concerned, not fully
     * resetting everything in this function, for that see this.stop(), which
     * calls this function.
     */
    private resetSourceNode(sourceNode: AudioBufferSourceNode): void {
        if (sourceNode) {
            sourceNode.stop();
            sourceNode.disconnect();
            const idx: number = this.scheduledSourceNodes.indexOf(sourceNode);
            if (idx !== -1) {
                delete this.scheduledSourceNodes[idx];
            }
        }
    }

    /**
     * Get the current playback (or paused-at) time.
     */
    public getTime(): number {
        if (this.pausedAt) {
            return this.pausedAt;
        }
        else if (this.startedAt) {
            return AUDIO_CONTEXT.currentTime - this.startedAt;
        }
        return 0;
    }

    /**
     * Play (now or later) an audio buffer.
     */
    public schedulePlay(
        audioBuffer: AudioBuffer,
        when: number = 0,
        offset: number = 0,
        startOffset: number = 0,
        onEnded?: () => void
    ): void {
        console.log('====> schedulePlay(when: ' + when.toFixed(2) +
                    ', offset: ' + offset.toFixed(2) +
                    ', startOffset: ' + startOffset.toFixed(2) +
                    ', startedAt: ' + this.startedAt.toFixed(2) + ')');

        // this.audioBuffer = audioBuffer;

        let sourceNode: AudioBufferSourceNode =
            AUDIO_CONTEXT.createBufferSource();

        sourceNode.connect(AUDIO_CONTEXT.destination);
        sourceNode.buffer = audioBuffer;

        if (onEnded) {
            sourceNode.onended = onEnded;
        }

        if (when === 0) {
            // start now
            if (this.pausedAt) {
                offset = this.pausedAt;
                startOffset = 0;
            }
            const startedAtOffset: number = offset + startOffset;
            this.sourceNode = sourceNode;
            sourceNode.start(0, offset);
            this.startedAt = AUDIO_CONTEXT.currentTime - startedAtOffset;
            console.log('====> START PLAY AT = ' + this.startedAt.toFixed(2));
            this.pausedAt = 0;
            this.isPlaying = true;
        }
        else {
            // start later (when)
            sourceNode.start(when, 0);
            // we save the scheduled source nodes in an array to avoid them
            // being garbage collected while they wait to be played.
            this.scheduledSourceNodes =
                prependArray(sourceNode, this.scheduledSourceNodes);
        }
    }

    /**
     * Pause playback - assumes we are playing.
     */
    public pause(): void {
        const elapsed: number = AUDIO_CONTEXT.currentTime - this.startedAt;
        // this.stop(elapsed);
        // TODO: we need to figure out monitoring, may need to uncomment below:
        // this.stopMonitoring;
        this.resetSourceNode(this.sourceNode);
        this.cancelScheduled();
        this.pausedAt = elapsed;
        this.isPlaying = false;
    }

    /**
     * Toggle state between play and pause
     */
    public togglePlayPause(): void {
        if (this.isPlaying) {
            this.pause();
            console.log('togglePlayPause(): pausing at: ' + this.pausedAt);
            // this.stopMonitoring();
        }
        else {
            this.startMonitoring();
            console.log('togglePlayPause(): playing from: ' + this.pausedAt);

            // this.schedulePlay(this.audioBuffer);
            // this.startMonitoring();
            // this.playFrom((this.pausedAt - this.startedAt) / this.duration);
            this.playFrom(this.progress);
        }
    }

    /**
     * If any audio buffer source nodes are in the scheduling queue to be
     * played, cancel them all.
     */
    public cancelScheduled(): void {
        console.log('*** resetting ' + this.scheduledSourceNodes.length +
                    ' scheduled ***');
        let node: AudioBufferSourceNode = this.scheduledSourceNodes.pop();
        while (node) {
            console.log('.');
            this.resetSourceNode(node);
            node = this.scheduledSourceNodes.pop();
        }
    }

    /**
     * Stop playback. If an argument is supplied it is where you want
     * to remain paused at after stopping. If not supplied, the default
     * is that you are stopped and paused at the very start (time=0).
     * @param {number} The time you want to be paused at after stopping.
     */
    // public stop(pausedAt: number = 0): void {
    public stop(): void {
        console.log('stop()');
        this.resetSourceNode(this.sourceNode);
        this.cancelScheduled();
        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
        this.stopMonitoring();
    }
}
