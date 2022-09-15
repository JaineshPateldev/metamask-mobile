// External dependencies.
import { UseAccounts } from '../../../UI/AccountSelectorList/hooks/useAccounts/useAccounts.types';
import { AccountConnectProps } from '..';

/**
 * AccountConnectMultiSelector props.
 */
export interface AccountConnectMultiSelectorProps
  extends AccountConnectProps,
    UseAccounts {
  onCancel: () => void;
  onConnect: () => void;
  selectedAddresses: string[];
  onSelectAddress: (addresses: string[]) => void;
  isLoading?: boolean;
  onCreateAccount: () => void;
  onOpenImportAccount: () => void;
  onOpenConnectHardwareWallet: () => void;
}
