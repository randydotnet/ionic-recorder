// Copyright (c) 2016 Tracktunes Inc

import {
    describe,
    expect,
    it
} from '@angular/core/testing';

import {
    configProvider,
    navControllerProvider,
    InstanceFixture,
    beforeEachDI
} from '../../services/test-utils/test-utils';

import {
    IdbAppFS
} from '../../providers/idb-app-fs/idb-app-fs';

import {
    IdbAppState
} from '../../providers/idb-app-state/idb-app-state';

import {
    LibraryPage
} from './library';

let instanceFixture: InstanceFixture = null;

describe('pages/library:LibraryPage', () => {
    instanceFixture = beforeEachDI(
        LibraryPage,
        [IdbAppFS, IdbAppState, configProvider, navControllerProvider],
        true,
        null
    );

    it('initializes', () => {
        expect(instanceFixture.instance).not.toBeNull();
        expect(instanceFixture.fixture).not.toBeNull();
    });
});
