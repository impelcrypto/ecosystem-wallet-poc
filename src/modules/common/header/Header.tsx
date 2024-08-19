"use client";

import styles from "./Header.module.css";

export function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <div>
        <span>Thirdweb Ecosystem Wallet Demo</span>
      </div>
      {/* <div>
				<ConnectButton
					client={client}
					wallets={[wallet]}
					// connectButton={{ className: styles.connectButton }}
				/>
			</div> */}
    </header>
  );
}
