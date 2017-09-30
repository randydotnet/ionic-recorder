// Copyright (c) 2017 Tracktunes Inc

// Lowest-level audio-buffer Web Audio Api playback class.
// This class only deals with a single audio-buffer, it
// knows nothing about multi-buffer streams or encodings.
// Plays for various encodings are in files with name player-X.ts
// (where 'X' is, e.g, 'wav' or 'webm') in play-wav.ts and are
// responsible for dealing with multiple-chunk files stored via indexedDB -
// these extension classes use this base class for single buffer operations.

import { Injectable } from '@angular/core';
import { AUDIO_CONTEXT } from './common';
import { MasterClock } from '../../services';
import { prependArray, formatSecondsTime } from '../../models/utils';

// the name of the function we give to master clock to run
const CLOCK_FUNCTION_NAME: string = 'player';

/**
 * Audio playback from an AudioBuffer (not from file, for playback from file,
 * see the classes that extend this one, e.g. wav-player.ts. Based on Web
 * Audio API. Originally this was based on code by Ian McGregor here:
 * http://codepen.io/ianmcgregor/pen/EjdJZZ
 *
 * @class WebAudioPlayer
 */
@Injectable()
export class WebAudioPlayer {
    private masterClock: MasterClock;
    private audioBuffer: AudioBuffer;
    protected sourceNode: AudioBufferSourceNode;
    private scheduledSourceNodes: AudioBufferSourceNode[];
    protected startedAt: number;
    private startedAtOffset: number;
    protected pausedAt: number;
    public isPlaying: boolean;
    public time: number;
    // public relativeTime: number;
    public duration: number;
    public displayTime: string;
    public displayDuration: string;

    /**
     *
     */
    constructor(masterClock: MasterClock) {
        console.log('WebAudioPlayer.constructor()');

        this.masterClock = masterClock;

        this.startedAt = 0;
        this.startedAtOffset = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
        this.scheduledSourceNodes = [];

        this.time = 0;
        // this.relativeTime = 0;
        this.duration = 0;
        this.displayTime = formatSecondsTime(0, 0);
        this.displayDuration = this.displayTime;
    }

    /**
     *
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
     *
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
     * Ensures change detection every GRAPHICS_REFRESH_INTERVAL
     */
    public startMonitoring(): void {
        // console.log('PLAYER: startMonitoring()');
        this.masterClock.addFunction(
            CLOCK_FUNCTION_NAME,
            // the monitoring actions are in the following function:
            () => {
                // const duration: number = this.getDuration();
                // console.log('dur: ' + duration);
                // if (this.duration !== duration) {
                //     // change detected
                //     this.duration = duration;
                //     this.displayDuration =
                //         formatSecondsTime(duration, duration);
                // }

                let time: number = this.getTime();

                if (time > this.duration) {
                    time = this.duration;
                    this.stop();
                    alert('We stopped when we need not have done so! Why?');
                }

                // this.time = this.relativeTime * this.duration;
//                if (time !== this.time) {
                    // change detected
                    console.log('Change detected!!! this.time (' +
                                this.time + ') !== time (' + time + ')');
                    this.time = time;
                    // this.relativeTime = time / this.duration;
                    this.displayTime = formatSecondsTime(time, this.duration);
//                }
                // console.log(this.displayTime + '/' + this.displayDuration);
            });
    }

    public getDisplayTime(): string {
        console.log('getDisplayTime(): ' + this.time + ', ' + this.duration);
        return formatSecondsTime(this.time, this.duration);
    }

    public getProgress(): number {
        return this.getTime() / this.duration;
    }

    /**
     * Stops monitoring (stops change detection)
     */
    public stopMonitoring(): void {
        setTimeout(
            () => {
                this.masterClock.removeFunction(CLOCK_FUNCTION_NAME);
            });
    }

    /**
     *
     */
    public getDuration(): number {
        // if (this.duration) {
        //     return this.duration;
        // }
        // else if (this.audioBuffer) {
        //     return this.audioBuffer.duration;
        // }
        // else {
        //     return 0;
        // }
        return this.duration;
    }

    /**
     *
     */
    public schedulePlay(
        audioBuffer: AudioBuffer,
        when: number = 0,
        offset: number = 0,
        startOffset: number = 0,
        onEnded?: () => void
    ): void {
        this.startMonitoring();
        console.log('====> schedulePlay(when: ' +
                    (when - this.startedAt).toFixed(2) + ', offset: ' +
                    offset.toFixed(2) + ', s-offset: ' +
                    startOffset.toFixed(2) + ')');
        this.audioBuffer = audioBuffer;

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
            this.startedAtOffset = offset + startOffset;
            this.sourceNode = sourceNode;
            // this.startedAt = AUDIO_CONTEXT.currentTime - offset;
            // console.log('this.starteAt: ' + this.startedAt);
            // console.log('====> this.starteAt 0: ' +
            //     (AUDIO_CONTEXT.currentTime - offset));
            sourceNode.start(0, offset);
            this.startedAt = AUDIO_CONTEXT.currentTime - this.startedAtOffset;

            console.log('====> this.starteAt = ' + this.startedAt.toFixed(2) +
                        ', stopping at: ' +
                        (this.startedAt + this.startedAtOffset +
                         this.audioBuffer.duration).toFixed(2));

            sourceNode.stop(this.startedAt + this.startedAtOffset +
                            this.audioBuffer.duration);
            this.pausedAt = 0;
            this.isPlaying = true;
            // only when you start do you start monitoring
            // this.startMonitoring();
        }
        else {
            // start later (when)
            // sourceNode.start(when, offset);
            sourceNode.start(when, 0);
            // we save the scheduled source nodes in an array to avoid them
            // being garbage collected while they wait to be played.
            // TODO: this array needs to be cleaned up when used - in onended?
            // this.scheduledSourceNodes.push(sourceNode);
            this.scheduledSourceNodes =
                prependArray(sourceNode, this.scheduledSourceNodes);
        }
    }

    /**
     *
     */
    public pause(): void {
        let elapsed: number = AUDIO_CONTEXT.currentTime - this.startedAt;
        this.stop();
        this.pausedAt = elapsed;
        this.stopMonitoring();
    }

    /**
     * Toggle state between play and pause
     */
    public togglePlayPause(): void {
        if (!this.isPlaying) {
            this.schedulePlay(this.audioBuffer);
        }
        else {
            this.pause();
            console.log('paused at: ' + this.pausedAt);
        }
    }

    /**
     *
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
     * Stop playback.
     */
    public stop(stopMonitoring: boolean = true): void {
        console.log('stop()');
        this.resetSourceNode(this.sourceNode);
        this.cancelScheduled();
        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
        if (stopMonitoring) {
            this.stopMonitoring();
        }
    }
}
