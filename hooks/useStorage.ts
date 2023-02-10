// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

type UseStorageReturnValue = {
  getItem: (key: string) => string;
  setItem: (key: string, value: string) => void;
  clear: () => void;
};

const useStorage = (): UseStorageReturnValue => {
  // TODO: fix the prerendering by enforce client side rendering
  const isBrowser: boolean = ((): boolean => typeof window !== "undefined")();
  const getItem = (key: string): string => {
    return isBrowser ? window["localStorage"][key] : undefined;
  };

  const setItem = (key: string, value: string): void => {
    return isBrowser ? window["localStorage"].setItem(key, value) : undefined;
  };

  const clear = () => {
    if (isBrowser) window["localStorage"].clear();
  };

  return {
    getItem,
    setItem,
    clear,
  };
};

export default useStorage;
