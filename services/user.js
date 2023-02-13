/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

"use strict";

module.exports = class User {
  constructor(id) {
    this.id = id;
    this.name = "";
    this.profile_pic = "";
    this.username = "";
  }
  
  setProfile(profile) {
    this.name = profile.name;
    this.profile_pic = profile.profile_pic;
    this.username = profile.username;
  }
};
