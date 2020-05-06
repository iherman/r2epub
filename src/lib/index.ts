/**
 * ## Externally accessible entries
 *
 * r2epub can be used as a library module both for TypeScript and for Javascript. The external entities are listed below; see their respective documentations for further information.
 *
 * @packageDocumentation
*/

/**
 *
 *
 */

import * as constants  from './constants';
import * as opf        from './opf';
import * as ocf        from './ocf';
import * as convert    from './convert';


export type Arguments = convert.Arguments;
export class RespecToEPUB  extends convert.RespecToEPUB {};

export class OCF extends ocf.OCF {};

export type ManifestItem = opf.ManifestItem;
export class PackageWrapper extends opf.PackageWrapper {};

export const text_content :string[] = constants.text_content;
export const media_types  :constants.MediaType  = constants.media_types;
