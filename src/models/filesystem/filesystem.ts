// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Rx';
import { downloadBlob, pathFileName } from '../../models';

/** @constant {number} */
export const DEFAULT_REQUEST_SIZE: number = 1024 * 1024 * 1024;

interface UsageAndQuota {
    usedBytes: number;
    grantedBytes: number;
}

export class Filesystem {
    /**
     *
     */
    public static getEntriesFromPaths(
        fileSystem: FileSystem,
        paths: string[]
    ): Observable<Entry[]> {
        console.log('getEntriesFromPaths(fs, [' + paths.join(', ') + '])');
        const entryObservableArray: Observable<Entry>[] =
              paths.map((path: string) => {
                  return Filesystem.getPathEntry(fileSystem, path, false);
              }),
              result: Entry[] = [],
              src: Observable<Entry[]> = Observable.create((observer) => {
                  Observable.from(entryObservableArray).concatAll().subscribe(
                      (entry: Entry) => {
                          result.push(entry);
                      },
                      (err: any) => {
                          observer.error(err);
                      },
                      () => {
                          observer.next(result);
                          observer.complete();
                      }
                  );
              });
        return src;
    }

    /**
     *
     */
    public static deleteEntries(
        fileSystem: FileSystem,
        paths: string[]
    ): Observable<void> {
        console.log('deleteEntries(fs, [' + paths.join(', ') + '])');
        const entryObservableArray: Observable<Entry>[] =
              paths.map((path: string) => {
                  return Filesystem.getPathEntry(fileSystem, path, false);
              }),
              src: Observable<void> = Observable.create((observer) => {
                  Observable.from(entryObservableArray).concatAll().subscribe(
                      (entry: Entry) => {
                          Filesystem.deleteEntry(entry).subscribe(
                              null,
                              (err1: any) => {
                                  observer.error(err1);
                              }
                          );
                      },
                      (err2: any) => {
                          observer.error(err2);
                      },
                      () => {
                          observer.next();
                          observer.complete();
                      }
                  );
              });
        return src;
    }

    /**
     *
     */
    public static moveEntries(
        fileSystem: FileSystem,
        paths: string[],
        parent: DirectoryEntry
    ): Observable<void> {
        console.log('moveEntries(fs, ' + paths + ',' +
                    parent.name + ')');
        const entryObservableArray: Observable<Entry>[] =
              paths.map((path: string) => {
                  return Filesystem.getPathEntry(fileSystem, path, false);
              }),
              src: Observable<void> = Observable.create((observer) => {
                  Observable.from(entryObservableArray).concatAll().subscribe(
                      (entry: Entry) => {
                          Filesystem.moveEntry(entry, parent).subscribe(
                              null,
                              (err1: any) => {
                                  observer.error(err1);
                              }
                          );
                      },
                      (err2: any) => {
                          observer.error(err2);
                      },
                      () => {
                          observer.next();
                          observer.complete();
                      }
                  );
              });
        return src;
    }

    /**
     *
     */
    public static moveEntry(
        entry: Entry,
        parent: DirectoryEntry
    ): Observable<void> {
        const src: Observable<void> = Observable.create((observer) => {
            entry.moveTo(
                parent,
                entry.name,
                (ent: Entry) => {
                    console.log('moveEntry.successCB()');
                    observer.next();
                    observer.complete();
                },
                (err: FileError) => {
                    console.log('moveEntry.errorCB()');
                    observer.error(err);
                }
            );
        });
        return src;
    }

    /**
     *
     */
    public static deleteEntry(entry: Entry): Observable<void> {
        const src: Observable<void> = Observable.create((observer) => {
            if (entry.isFile) {
                entry.remove(
                    () => {
                        observer.next();
                        observer.complete();
                    },
                    (err: FileError) => {
                        console.log(err);
                        observer.error(err);
                    }
                );
            }
            else if (entry.isDirectory) {
                (<DirectoryEntry>entry).removeRecursively(
                    () => {
                        observer.next();
                        observer.complete();
                    },
                    (err: FileError) => {
                        console.log(err);
                        observer.error(err);
                    }
                );
            }
        });
        return src;
    }

    /**
     *
     */
    public static getPathEntry(
        fileSystem: FileSystem,
        path: string,
        bCreate: boolean = false
    ): Observable<Entry> {
        console.log('getPathEntry(fs, ' + path + ', ' +
                    bCreate + ')');
        const src: Observable<Entry> = Observable.create((observer) => {
            if (path === '/') {
                observer.next(fileSystem.root);
                observer.complete();
            }
            else if (path[path.length - 1] === '/') {
                // it's a folder
                fileSystem.root.getDirectory(
                    path,
                    { create: bCreate },
                    (directoryEntry: DirectoryEntry) => {
                        observer.next(directoryEntry);
                        observer.complete();
                    },
                    (err: any) => {
                        console.log(err);
                        observer.error(err);
                    }
                );
            } // if (path[path.length - 1] === '/') {
            else {
                // it's a file
                console.log('fileSystem.root.getFile(' + path + ', ' +
                            bCreate + ')');
                fileSystem.root.getFile(
                    path,
                    { create: bCreate },
                    (fileEntry: FileEntry) => {
                        observer.next(fileEntry);
                        observer.complete();
                    },
                    (err: any) => {
                        console.log(err);
                        observer.error(err);
                    }
                );
            } // if (path[path.length - 1] === '/') { .. else { ..}
        });
        return src;
    }

    /**
     *
     */
    public static queryUsageAndQuota(
        bPersistent: boolean
    ): Observable<UsageAndQuota> {
        const
        storageType: string =
            bPersistent ? 'webkitPersistentStorage' : 'webkitTemporaryStorage',
        src: Observable<UsageAndQuota> = Observable.create(
            (observer) => {
                navigator[storageType].queryUsageAndQuota(
                    (usedBytes: number, grantedBytes: number) => {
                        observer.next({
                            usedBytes: usedBytes,
                            grantedBytes: grantedBytes
                        });
                        observer.complete();
                    },
                    (err: any) => {
                        observer.error(err);
                    }
                );
            });
        return src;
    }

    /**
     *
     */
    public static requestQuota(bPersistent: boolean): Observable<number> {
        const
        storageType: string =
            bPersistent ? 'webkitPersistentStorage' : 'webkitTemporaryStorage',
        src: Observable<number> = Observable.create(
            (observer) => {
                navigator[storageType].requestQuota(
                    DEFAULT_REQUEST_SIZE, (grantedBytes: number) => {
                        observer.next(grantedBytes);
                        observer.complete();
                    },
                    (err: any) => {
                        observer.error(err);
                    }
                );
            });
        return src;
    }

    /**
     *
     */
    public static getFileSystem(
        bPersistent: boolean = true,
        requestSize: number = DEFAULT_REQUEST_SIZE
    ): Observable<FileSystem> {
        console.log('getFileSystem(bPersistent=' + bPersistent +
                    ', requestSize=' + requestSize + ')');
        const
        fsType: number =
            bPersistent ? window.PERSISTENT :  window.TEMPORARY,
        /*
        src: Observable<FileSystem> = Observable.create((observer) => {
            window['webkitStorageInfo'].requestQuota(
                fsType,
                requestSize,
                (grantedBytes: number) => {
                    ( window.requestFileSystem ||
                      window['webkitRequestFileSystem']
                    )(
                        fsType,
                        grantedBytes,
                        (fs: FileSystem) => {
                            observer.next(fs);
                            observer.complete();
                        },
                        (err: any) => {
                            console.log(err);
                            observer.error(err);
                        }
                    );
                },
                (err: any) => {
                    observer.error(err);
                }
            );
        });
        */
        src: Observable<FileSystem> = Observable.create((observer) => {
            Filesystem.requestQuota(bPersistent).subscribe(
                (grantedBytes: number) => {
                    ( window.requestFileSystem ||
                      window['webkitRequestFileSystem']
                    )(
                        fsType,
                        grantedBytes,
                        (fs: FileSystem) => {
                            observer.next(fs);
                            observer.complete();
                        },
                        (err: any) => {
                            console.log(err);
                            observer.error(err);
                        }
                    );
                }
            );
        });
        return src;
    }

    /**
     * Write data into a file, starting at a particular location.
     * @param {string} path - the file to write to.
     * @param {Blob} blob - the data to write.
     * @param {number} seekOffset - the location (byte) to start writing from.
     * @param {boolean} bCreate - whether to create the file first or not.
     * @return {Observable<void>}
     */
    public static writeToFile(
        fs: FileSystem,
        path: string,
        blob: Blob,
        seekOffset: number,
        bCreate: boolean
    ): Observable<void> {
        console.log('writeToFile(fs, ' + path +
                    ', bCreate=' + bCreate + ')');
        const src: Observable<void> = Observable.create((observer) => {
            fs.root.getFile(
                path,
                { create: bCreate },
                (fileEntry: FileEntry) => {
                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(
                        (fileWriter: FileWriter) => {
                            fileWriter.onwriteend = (event: any) => {
                                observer.next();
                                observer.complete();
                            };

                            fileWriter.onerror = (err1: any) => {
                                observer.error(err1);
                            };
                            if (seekOffset > 0) {
                                fileWriter.seek(seekOffset);
                            }
                            fileWriter.write(blob);
                        },
                        (err1: any) => {
                            observer.error(err1);
                        }
                    );
                },
                (err2: any) => {
                    observer.error(err2);
                }
            ); // fs.root.getFile(
        });
        return src;
    }

    /**
     *
     */
    public static appendToFile(
        fs: FileSystem,
        path: string,
        blob: Blob
    ): Observable<FileEntry> {
        console.log('appendToFile(fs, ' + path + ', blob)');
        const src: Observable<FileEntry> = Observable.create((observer) => {
            fs.root.getFile(
                path,
                { create: false },
                (fileEntry: FileEntry) => {
                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(
                        (fileWriter: FileWriter) => {
                            fileWriter.onwriteend = (event: any) => {
                                console.log('appendToFile() - ' +
                                            'Wrote ' + blob.size + ' bytes. ' +
                                            'Accum = ' + fileWriter.length +
                                            ' bytes');
                                observer.next(fileEntry);
                                observer.complete();
                            };
                            fileWriter.onerror = (err1: any) => {
                                console.log(err1);
                                observer.error(err1);
                            };
                            // see to end and write from there
                            fileWriter.seek(fileWriter.length);
                            fileWriter.write(blob);
                        },
                        (err2: any) => {
                            console.log(err2);
                            observer.error(err2);
                        }
                    );
                },
                (err3: any) => {
                    console.log(err3);
                    observer.error(err3);
                }
            ); // fs.root.getFile(
        });
        return src;
    }

    /**
     *
     */
    public static getMetadata(
        fs: FileSystem,
        path: string
    ): Observable<Metadata> {
        console.log('getMetadata(fs, ' + path + ')');
        const src: Observable<Metadata> = Observable.create((observer) => {
            fs.root.getFile(
                path,
                { create: false },
                (fileEntry: FileEntry) => {
                    fileEntry.getMetadata(
                        (metadata: Metadata) => {
                            observer.next(metadata);
                            observer.complete();
                        },
                        (err1: FileError) => {
                            console.log(err1);
                            observer.error(err1);
                        }
                    );
                },
                (err2: any) => {
                    console.log(err2);
                    observer.error(err2);
                }
            ); // fs.root.getFile(
        });
        return src;
    }

    /**
     *
     */
    public static downloadFileToDevice(
        fs: FileSystem,
        path: string
    ): Observable<void> {
        const src: Observable<void> = Observable.create((observer) => {
            fs.root.getFile(
                path,
                { create: false },
                (fileEntry: FileEntry) => {
                    fileEntry.file(
                        (file: File) => {
                            const name: string = pathFileName(path),
                                  len: number = name.length,
                                  bSuffix: boolean = name.slice(len - 4, len)
                                  .toLowerCase() === '.wav';
                            downloadBlob(file, bSuffix ? name : name + '.wav');
                        }
                    );
                }
            );
        });
        return src;
    }

    /**
     *
     */
    public static readFromFile(
        fs: FileSystem,
        path: string,
        startByte: number = null,
        endByte: number = null
    ): Observable<ArrayBuffer> {
        console.log('readFromFile(fs, ' + path + ', ' +
                    startByte + ', ' + endByte + ')');
        const src: Observable<ArrayBuffer> = Observable.create((observer) => {
            fs.root.getFile(
                path,
                { create: false },
                (fileEntry: FileEntry) => {
                    fileEntry.file(
                        (file: File) => {
                            const fileReader: FileReader = new FileReader();
                            fileReader.onloadend = (event: ProgressEvent) => {
                                console.log('onloadend: filereader.result = ' +
                                            fileReader.result.byteLength);
                                // console.dir(fileReader.result);
                                observer.next(fileReader.result);
                                observer.complete();
                            };

                            fileReader.onerror = (err1: any) => {
                                console.log(err1);
                                observer.error(err1);
                            };

                            if (startByte || endByte) {
                                // >=1 of startByte nor endByte were
                                // specified, read from startByte to
                                // endByte this is where we call slice()
                                const start: number = startByte || 0,
                                      end: number = endByte || file.size,
                                      blob: Blob = file.slice(start, end);
                                // we may need to give the blob (a) a
                                // header, (b) a mime type and then the
                                // chunks may be decoded - try that next.
                                fileReader.readAsArrayBuffer(blob);
                            }
                            else {
                                // neither startByte nor endByte were
                                // specified, read entire file
                                fileReader.readAsArrayBuffer(file);
                            }
                        },
                        (err2: any) => {
                            console.log(err2);
                            observer.error(err2);
                        }
                    );
                },
                (err3: any) => {
                    console.log(err3);
                    observer.error(err3);
                }
            ); // fs.root.getFile(

        });
        return src;
    }

    /**
     *
     */
    public static createFolder(
        parentDirectoryEntry: DirectoryEntry,
        name: string
    ): Observable<DirectoryEntry> {
        console.log('createFolder(' +
                    parentDirectoryEntry.fullPath + ', ' + name + ')');
        const src: Observable<DirectoryEntry> = Observable.create(
            (observer) => {
                parentDirectoryEntry.getDirectory(
                    name,
                    { create: true },
                    (directoryEntry: DirectoryEntry) => {
                        observer.next(directoryEntry);
                        observer.complete();
                    },
                    (err: any) => {
                        observer.error(err);
                    }
                );
            });
        return src;
    }

    /**
     *
     */
    public static readFolderEntries(
        directoryEntry: DirectoryEntry
    ): Observable<Entry[]> {
        console.log('readFolderEntries(' + directoryEntry.fullPath + ')');
        const src: Observable<Entry[]> = Observable.create((observer) => {
            let dirReader: DirectoryReader = directoryEntry.createReader(),
                results: Entry[] = [],
                readEntries: () => void = () => {
                    dirReader.readEntries(
                        (entries: Entry[]) => {
                            if (entries.length) {
                                results = results.concat(entries);
                                readEntries();
                            }
                            else {
                                // base case - done
                                observer.next(results);
                                observer.complete();
                            }
                        },
                        (err: any) => {
                            observer.error(err);
                        }
                    );
                };
            // start reading dir entries
            readEntries();
        });
        return src;
    }

    /**
     *
     */
    public static eraseEverything(fileSystem: FileSystem): Observable<void> {
        const src: Observable<void> = Observable.create((observer) => {
            Filesystem.readFolderEntries(fileSystem.root).subscribe(
                (entries: Entry[]) => {
                    const paths: string[] = entries.map(
                        (entry: Entry): string => {
                            return entry.fullPath + (entry.isFile ? '' : '/');
                        }
                    );
                    Filesystem.deleteEntries(fileSystem, paths).subscribe(
                        () => {
                            observer.next();
                            observer.complete();
                        },
                        (err1: any) => {
                            observer.error(err1);
                        }
                    );
                },
                (err2: any) => {
                    observer.error(err2);
                }
            );
        });
        return src;
    }

}
