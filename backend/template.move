// --- This is the base template for the NFT contract ---

// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

// The module name is a placeholder replaced by the backend
module __PROJECT_NAME__::__MODULE_NAME__ {
    use sui::url::{Self, Url};
    use std::string::{Self, String};
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // The NFT struct name is a placeholder
    struct __NFT_NAME__ has key, store {
        id: UID,
        name: String,
        description: String,
        url: Url,
    }

    // --- Placeholder area for minting logic ---
    // __MINT_LOGIC__
    // --- End of placeholder area for minting logic ---

    // --- Public getter functions ---
    public fun name(nft: &__NFT_NAME__): &String {
        &nft.name
    }

    public fun description(nft: &__NFT_NAME__): &String {
        &nft.description
    }

    public fun url(nft: &__NFT_NAME__): &Url {
        &nft.url
    }
}