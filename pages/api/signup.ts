// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

import { createSignupHandler } from "../../lib/server/signup";

// Keep this secret-bearing module reachable only through a server API route.
export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

export default createSignupHandler();
