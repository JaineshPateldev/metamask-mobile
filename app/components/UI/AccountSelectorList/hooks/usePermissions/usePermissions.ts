/* eslint-disable import/prefer-default-export */

// Third party dependencies.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toChecksumAddress } from 'ethereumjs-util';
import { KeyringTypes } from '@metamask/controllers';
import { isEqual } from 'lodash';

// External Dependencies.
import UntypedEngine from '../../../../../core/Engine';

// Internal dependencies
import {
  PermittedAccountsByHost,
  UsePermissions,
  UsePermissionsParams,
} from './usePermissions.types';

/**
 * Hook that returns both wallet accounts and ens name information.
 *
 * @returns Object that contins both wallet accounts and ens name information.
 */
export const usePermissions =
  ({}: UsePermissionsParams = {}): UsePermissions => {
    const Engine = UntypedEngine as any;
    const isMountedRef = useRef(false);
    const [permittedAccountsByHost, setPermittedAccountsByHost] =
      useState<PermittedAccountsByHost>({});
    const PS = useSelector(
      (state: any) => state.engine.backgroundState.PermissionController,
    );

    console.log('USE PERMISSIONS', PS);

    //   const getAccounts = useCallback(() => {
    //     // Keep track of the Y position of account item. Used for scrolling purposes.
    //     let yOffset = 0;
    //     let selectedIndex = 0;
    //     // Reading keyrings directly from Redux doesn't work at the momemt.
    //     const keyrings: any[] = Engine.context.KeyringController.state.keyrings;
    //     const flattenedAccounts: Account[] = keyrings.reduce((result, keyring) => {
    //       const {
    //         accounts: accountAddresses,
    //         type,
    //       }: { accounts: string[]; type: KeyringTypes } = keyring;
    //       for (const index in accountAddresses) {
    //         const address = accountAddresses[index];
    //         const isSelected = selectedAddress === address;
    //         if (isSelected) {
    //           selectedIndex = result.length;
    //         }
    //         const checksummedAddress = toChecksumAddress(address);
    //         const identity = identities[checksummedAddress];
    //         if (!identity) continue;
    //         const { name } = identity;
    //         // TODO - Improve UI to either include loading and/or balance load failures.
    //         const balanceWeiHex =
    //           accountInfoByAddress?.[checksummedAddress]?.balance || 0x0;
    //         const balanceETH = renderFromWei(balanceWeiHex); // Gives ETH
    //         const balanceFiat = weiToFiat(
    //           hexToBN(balanceWeiHex) as any,
    //           conversionRate,
    //           currentCurrency,
    //         );
    //         const balanceTicker = getTicker(ticker);
    //         const balanceLabel = `${balanceFiat}\n${balanceETH} ${balanceTicker}`;
    //         const balanceError = checkBalanceError?.(balanceWeiHex);
    //         const mappedAccount: Account = {
    //           name,
    //           address: checksummedAddress,
    //           type,
    //           yOffset,
    //           isSelected,
    //           // TODO - Also fetch assets. Reference AccountList component.
    //           // assets
    //           assets: { fiatBalance: balanceLabel },
    //           balanceError,
    //         };
    //         result.push(mappedAccount);
    //         // Calculate height of the account item.
    //         yOffset += 78;
    //         if (balanceError) {
    //           yOffset += 22;
    //         }
    //         if (type !== KeyringTypes.hd) {
    //           yOffset += 24;
    //         }
    //       }
    //       return result;
    //     }, []);
    //     setAccounts(flattenedAccounts);
    //     fetchENSNames({ flattenedAccounts, startingIndex: selectedIndex });
    //     /* eslint-disable-next-line */
    //   }, [
    //     selectedAddress,
    //     identities,
    //     fetchENSNames,
    //     accountInfoByAddress,
    //     conversionRate,
    //     currentCurrency,
    //     ticker,
    //     checkBalanceError,
    //   ]);

    //   useEffect(() => {
    //     if (!isMountedRef.current) {
    //       isMountedRef.current = true;
    //     }
    //     if (isLoading) return;
    //     // setTimeout is needed for now to ensure next frame contains updated keyrings.
    //     setTimeout(getAccounts, 0);
    //     // Once we can pull keyrings from Redux, we will replace the deps with keyrings.
    //     return () => {
    //       isMountedRef.current = false;
    //     };
    //   }, [getAccounts, isLoading]);

    return { permittedAccountsByHost };
  };
