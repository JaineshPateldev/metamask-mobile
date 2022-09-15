/* eslint-disable import/prefer-default-export */

/**
 * Mapping of permitted account addresses by host name.
 */
export type PermittedAccountsByHost = Record<string, string[]>;

/**
 * Optional params that usePermissions hook takes.
 */
export interface UsePermissionsParams {
  //   /**
  //    * Optional callback that is used to check for a balance requirement. Non-empty string will render the account item non-selectable.
  //    * @param balance - The ticker balance of an account in wei and hex string format.
  //    */
  //   checkBalanceError?: AccountSelectorListProps['checkBalanceError'];
  //   /**
  //    * Optional boolean that indicates if accounts are being processed in the background. Setting this to true will prevent any unnecessary updates while loading.
  //    * @default false
  //    */
  //   isLoading?: boolean;
}

/**
 * Return value for usePermissions hook.
 */
export interface UsePermissions {
  /**
   * Mapping of permitted account addresses by host name.
   */
  permittedAccountsByHost: PermittedAccountsByHost;
}
