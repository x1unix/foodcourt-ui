import { isNil, isObject, isArray, find, isEmpty } from 'lodash';

/**
 * Object differ
 */
export class ObjectDiffer<T> {
  /**
   * Compare two objects
   * @param {T} source Source
   * @param {T} changed Changed object
   * @param {boolean} compact Omit null or undefined values
   * @returns {T}
   */
  compare(source: T, changed: T, compact = true): T {
    const result = {};

    const changedKeys = Object.keys(source);

    changedKeys.forEach((prop) => {
      if (!source.hasOwnProperty(prop)) {
        result[prop] = changed[prop];
        return;
      }

      const srcVal = source[prop];
      const newVal = changed[prop];

      if (isArray(newVal)) {
        // Currently the easiest known way to compare arrays.
        // If you have better idea - feel free to replace this code.
        if (String(srcVal) !== String(newVal)) {
          result[prop] = changed[prop];
        }
      } else if (isObject(newVal)) {
        const differ = new ObjectDiffer();
        const diff = differ.compare(srcVal, newVal);

        if (!isEmpty(diff)) {
          result[prop] = diff;
        }
      } else if (srcVal !== newVal) {
        if (isNil(newVal) && compact) {
          return;
        }
        result[prop] = changed[prop];
      }
    });

    return <T>result;
  }
}

/**
 * Collection diff result
 */
export interface ICollectionDiff<T> {
  /**
   * New added items
   */
  newItems: T[];

  /**
   * Changed items
   */
  changes: T[];

  /**
   * Removed items
   */
  removed: T[];

  /**
   * Removed unique keys
   */
  removedKeys: Array<string | number>;
}

/**
 * Object colleciton differ
 */
export class CollectionDiffer<T> {
  protected primaryKeySet = false;

  /**
   * Constructor
   * @param {string} primaryKey Unique property name
   */
  constructor(protected primaryKey: string = null) {
    this.primaryKeySet = this.primaryKey !== null;
  }

  /**
   * Compare collections
   * @param {T[]} original Original
   * @param {T[]} changed Target
   * @returns {ICollectionDiff<T>}
   */
  compare(original: T[], changed: T[]): ICollectionDiff<T> {
    const differ = new ObjectDiffer<T>();

    let newItems: T[] = [];
    const changes: T[] = [];
    const removed: T[] = [];
    const removedKeys: Array<number | string> = [];

    //
    // changed.forEach((item: T) => {
    //   if (this.primaryKeySet && !isNil(item[this.primaryKey])) {
    //
    //   }
    // });

    // Check each item in source list
    original.forEach((src: T) => {
      // Check if the source item has primary key defined
      // and check if exists in the new collection
      if (this.primaryKeySet && !isNil(src[this.primaryKey])) {
        const needle = {};
        const itemId = src[this.primaryKey];
        needle[this.primaryKey] = itemId;
        const newSrc = find(changed, needle);

        // mark item as removed if item not found by id
        if (isNil(newSrc)) {
          removedKeys.push(itemId);
        } else if (newSrc.length > 1) {
          // Throw error if more that 1 item exists with specified unique key value
          throw new ReferenceError(`Property '${this.primaryKey}' must be unique, but more than 1 items found with value '${itemId}'`);
        } else {
          // else - diff objects
          const diff = differ.compare(src, newSrc);
          if (!isEmpty(diff)) {
            diff[this.primaryKey] = itemId;
            changes.push(diff);
          }
        }
      } else {
        // Check for items without primary key
        if (!changed.includes(src)) {
          removed.push(src);
        }
      }
    });

    // Check new collection for items without primary key
    // We'll assume them as the 'new' items
    newItems = [...changed.filter((i) => isNil(i[this.primaryKey]))];

    return {
      newItems,
      changes,
      removed,
      removedKeys
    };
  }
}
