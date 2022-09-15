import { UseAccounts } from '../../../UI/AccountSelectorList/hooks/useAccounts/useAccounts.types';

/**
 * AccountConnectSingleSelector props.
 */
export interface AccountConnectSingleSelectorProps extends UseAccounts {
  onBack: () => void;
  onSelectAccount: (address: string) => void;
  selectedAddresses: string[];
  isLoading?: boolean;
  onCreateAccount: () => void;
  onOpenImportAccount: () => void;
  onOpenConnectHardwareWallet: () => void;
}
