import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const Logo = () => {
  return (
    <svg
      height="30"
      viewBox="0 0 520 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M233.5 0H244.8V170H233.5V0Z"
        fill="currentColor"
        opacity={0.85}
      />
      <path
        d="M55.3 77.4999C55.3 71.4999 44.4 66.1999 38.5 66.1999H28.2C22.2 66.1999 11.4 71.5999 11.4 77.4999V140.1H0V57.2999C3.2 57.2999 8.4 59.2999 10.1 64.7999C15.5 59.3999 22.7 56.3999 27.4 56.3999H40.6C51.6 56.3999 66.6 65.9999 66.6 77.0999V140.2H55.3V77.4999Z"
        fill="#CD1719"
      />
      <path
        d="M153.9 140.1H141.5L122.8 103.4H112.5L94 140.1H82.1L104 98.5L82.9 57.3H95L113.4 93.7H123.3L141.5 57.3H153L131.9 97.9001L153.9 140.1Z"
        fill="#CD1719"
      />
      <path
        d="M180.8 119C180.8 125 191.5 130.5 197.6 130.5H208.5V140.1H195.5C184.5 140.1 169.5 130.5 169.5 119.4V30H180.8V57.2H208.5C208 60.4 205.1 66.8 196.6 66.8H180.8V119Z"
        fill="#CD1719"
      />
      <path
        d="M457.102 45.4546L476.168 77.6776H476.906L496.065 45.4546H518.639L489.786 92.7273L519.286 140H496.296L476.906 107.731H476.168L456.778 140H433.881L463.472 92.7273L434.435 45.4546H457.102Z"
        fill="currentColor"
        opacity={0.85}
      />
      <path
        d="M366.214 140V45.4546H428.813V61.9354H386.203V84.4638H424.658V100.945H386.203V140H366.214Z"
        fill="currentColor"
        opacity={0.85}
      />
      <path
        d="M333.909 76.0156C333.263 73.7689 332.355 71.7838 331.185 70.0603C330.016 68.306 328.585 66.8288 326.892 65.6285C325.23 64.3974 323.322 63.4587 321.168 62.8124C319.044 62.1661 316.69 61.843 314.104 61.843C309.272 61.843 305.025 63.0433 301.363 65.4438C297.731 67.8444 294.9 71.3375 292.869 75.9232C290.837 80.4782 289.822 86.0487 289.822 92.6349C289.822 99.2211 290.822 104.822 292.822 109.439C294.823 114.055 297.654 117.579 301.317 120.011C304.979 122.411 309.303 123.611 314.289 123.611C318.813 123.611 322.676 122.811 325.876 121.211C329.108 119.58 331.57 117.287 333.263 114.332C334.986 111.378 335.848 107.885 335.848 103.853L339.91 104.453H315.536V89.4033H355.099V101.314C355.099 109.624 353.344 116.764 349.836 122.734C346.327 128.674 341.495 133.26 335.34 136.491C329.185 139.692 322.137 141.293 314.197 141.293C305.333 141.293 297.547 139.338 290.837 135.43C284.128 131.49 278.896 125.904 275.141 118.672C271.417 111.409 269.555 102.791 269.555 92.8195C269.555 85.1562 270.663 78.3238 272.879 72.3224C275.126 66.2902 278.265 61.1813 282.297 56.9957C286.329 52.8101 291.022 49.6247 296.377 47.4396C301.732 45.2544 307.534 44.1619 313.781 44.1619C319.136 44.1619 324.122 44.9467 328.739 46.5163C333.355 48.0551 337.448 50.2402 341.018 53.0717C344.619 55.9031 347.558 59.2731 349.836 63.1817C352.113 67.0596 353.575 71.3375 354.222 76.0156H333.909Z"
        fill="currentColor"
        opacity={0.85}
      />
    </svg>
  )
}

const config: DocsThemeConfig = {
  logo: <Logo />,
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" href="/favicon.png" type="image/png" />
    </>
  ),
  useNextSeoProps: () => ({ titleTemplate: '%s — nxt|gfx', description: 'Make HTML graphics for CasparCG' }),
  project: {
    link: 'https://github.com/nxtedition/create-caspar-graphics',
  },
  docsRepositoryBase: 'https://github.com/nxtedition/create-caspar-graphics',
  footer: {
    text: (
      <div className="nx-flex nx-flex-col nx-items-start">
        <div>
          <a
            className="nx-flex nx-text-current"
            target="_blank"
            rel="noopener noreferrer"
            title="nxtedition.com homepage"
            href="https://nxtedition.com?utm_source=gfx.nxtedition.com"
          >
            <svg height="22" viewBox="0 0 503 90">
              <g>
                <path
                  d="M41.1 89.4V42.8C41.1 38.4 33.1 34.4 28.6 34.4H21C16.5 34.4 8.4 38.4 8.4 42.8V89.4H0V27.8C1.67981 27.8277 3.30828 28.3835 4.65446 29.3887C6.00064 30.3938 6.99622 31.7973 7.5 33.4C11.5 29.4 16.9 27.1 20.4 27.1H30.2C38.4 27.1 49.6 34.3 49.6 42.5V89.5H41M114.4 89.5H105.2L91.3 62H83.7L70 89.4H61.2L77.4 58.4L61.7 27.8H70.7L84.4 54.9H91.8L105.4 27.8H113.9L98.1 58L114.5 89.4M134.5 73.7C134.5 78.1 142.5 82.2 147.1 82.2H155.1V89.4H145.5C137.3 89.4 126.1 82.2 126.1 74V7.5H134.5V27.8H155.2C154.879 29.9113 153.774 31.8243 152.107 33.1584C150.439 34.4925 148.33 35.1499 146.2 35H134.5V73.7Z"
                  fill="#D22027"
                />
                <path
                  d="M205.2 53.7V42.8C205.2 38.4 197.2 34.4 192.7 34.4H185.1C180.7 34.4 172.6 38.4 172.6 42.8V53.7H205.2ZM213.6 42.5V60.8H172.6V74.3C172.6 78.8 180.6 82.8 185.1 82.8H193C196.7 82.8 203 80 205 76.4L212.1 80.4C210.118 83.2463 207.51 85.6006 204.476 87.2821C201.443 88.9636 198.064 89.9276 194.6 90.1H183.6C175.3 90.1 164.2 82.9 164.2 74.7V42.5C164.2 34.3 175.3 27.1 183.5 27.1H194.3C202.5 27.1 213.6 34.3 213.6 42.5ZM236.5 74.3C236.5 78.8 244.4 82.8 249 82.8H256.4C261.2 82.8 269.1 78.8 269.1 74.3V42.8C269.1 38.4 261.2 34.4 256.4 34.4H249C244.4 34.4 236.5 38.4 236.5 42.8V74.3ZM247.5 27.1H257.1C260.9 27.1 265.3 29.1 269.1 32.5V0H277.5V89.4C274.8 89.4 271 87.6 270.1 83.8C266.664 87.393 262.049 89.6293 257.1 90.1H247.4C239.2 90.1 228.1 82.9 228.1 74.7V42.5C228.1 34.3 239.2 27.1 247.4 27.1M303.8 89.4H295.4V27.8H303.8V89.4ZM303.8 8.4H295.4V0H303.8V8.4ZM329.6 73.7C329.6 78.1 337.6 82.2 342.1 82.2H350.1V89.4H340.5C332.3 89.4 321.1 82.2 321.1 74V7.5H329.6V27.8H350.2C349.88 29.893 348.79 31.7912 347.144 33.1229C345.498 34.4546 343.414 35.124 341.3 35H329.6V73.7ZM370.8 89.4H362.4V27.8H370.8V89.4ZM370.8 8.4H362.4V0H370.8V8.4ZM428.4 42.8C428.4 38.4 420.4 34.4 415.9 34.4H408.5C403.9 34.4 396 38.4 396 42.8V74.3C396 78.8 404 82.8 408.5 82.8H415.9C420.5 82.8 428.4 78.8 428.4 74.3V42.8ZM436.9 42.5V74.7C436.9 82.9 425.7 90.1 417.5 90.1H406.9C398.7 90.1 387.5 82.9 387.5 74.7V42.5C387.5 34.3 398.7 27.1 406.9 27.1H417.5C425.7 27.1 436.9 34.3 436.9 42.5ZM494.6 89.5V42.7C494.6 38.3 486.6 34.3 482.1 34.3H474.5C470 34.3 461.9 38.3 461.9 42.7V89.3H453.5V27.8C455.18 27.8277 456.808 28.3835 458.154 29.3887C459.501 30.3938 460.496 31.7973 461 33.4C465 29.4 470.4 27.1 473.9 27.1H483.7C491.9 27.1 503.1 34.3 503.1 42.5V89.5H494.6Z"
                  fill="currentColor"
                />
              </g>
            </svg>
          </a>
        </div>
        <p className="nx-mt-6 nx-text-xs">
          © {new Date().getFullYear()} Caspar Graphics
        </p>
      </div>
    ),
  },
}

export default config
