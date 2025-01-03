import re

tickers = [
    '1INCHEUR',
    '1INCHUSD',
    'AAVEETH',
    'AAVEEUR',
    'AAVEGBP',
    'AAVEUSD',
    'AAVEXBT',
    'ACAEUR',
    'ACAUSD',
    'ACHEUR',
    'ACHUSD',
    'ADAAUD',
    'ADAETH',
    'ADAEUR',
    'ADAGBP',
    'ADAUSD',
    'ADAUSDT',
    'ADAXBT',
    'ADXEUR',
    'ADXUSD',
    'AGLDEUR',
    'AGLDUSD',
    'AIREUR',
    'AIRUSD',
    'AKTEUR',
    'AKTUSD',
    'ALCXEUR',
    'ALCXUSD',
    'ALGOETH',
    'ALGOEUR',
    'ALGOGBP',
    'ALGOUSD',
    'ALGOUSDT',
    'ALGOXBT',
    'ALICEEUR',
    'ALICEUSD',
    'ALPHAEUR',
    'ALPHAUSD',
    'ANKREUR',
    'ANKRUSD',
    'ANKRXBT',
    'ANTETH',
    'ANTEUR',
    'ANTUSD',
    'ANTXBT',
    'APEEUR',
    'APEUSD',
    'APEUSDT',
    'API3EUR',
    'API3USD',
    'APTEUR',
    'APTUSD',
    'ARBEUR',
    'ARBUSD',
    'ARPAEUR',
    'ARPAUSD',
    'ASTREUR',
    'ASTRUSD',
    'ATLASEUR',
    'ATLASUSD',
    'ATOMETH',
    'ATOMEUR',
    'ATOMGBP',
    'ATOMUSD',
    'ATOMUSDT',
    'ATOMXBT',
    'AUDIOEUR',
    'AUDIOUSD',
    'AUDJPY',
    'AUDUSD',
    'AVAXEUR',
    'AVAXUSD',
    'AVAXUSDT',
    'AXSEUR',
    'AXSUSD',
    'BADGEREUR',
    'BADGERUSD',
    'BALEUR',
    'BALUSD',
    'BALXBT',
    'BANDEUR',
    'BANDUSD',
    'BATETH',
    'BATEUR',
    'BATUSD',
    'BATXBT',
    'BCHAUD',
    'BCHETH',
    'BCHEUR',
    'BCHGBP',
    'BCHJPY',
    'BCHUSD',
    'BCHUSDT',
    'BCHXBT',
    'BEAMEUR',
    'BEAMUSD',
    'BICOEUR',
    'BICOUSD',
    'BITEUR',
    'BITUSD',
    'BLUREUR',
    'BLURUSD',
    'BLZEUR',
    'BLZUSD',
    'BNCEUR',
    'BNCUSD',
    'BNTEUR',
    'BNTUSD',
    'BOBAEUR',
    'BOBAUSD',
    'BONDEUR',
    'BONDUSD',
    'BONKEUR',
    'BONKUSD',
    'BRICKEUR',
    'BRICKUSD',
    'BSXEUR',
    'BSXUSD',
    'BTTEUR',
    'BTTUSD',
    'C98EUR',
    'C98USD',
    'CELREUR',
    'CELRUSD',
    'CFGEUR',
    'CFGUSD',
    'CHREUR',
    'CHRUSD',
    'CHZEUR',
    'CHZUSD',
    'COMPEUR',
    'COMPUSD',
    'COMPXBT',
    'COTIEUR',
    'COTIUSD',
    'CQTEUR',
    'CQTUSD',
    'CRVEUR',
    'CRVUSD',
    'CRVXBT',
    'CSMEUR',
    'CSMUSD',
    'CTSIEUR',
    'CTSIUSD',
    'CVCEUR',
    'CVCUSD',
    'CVXEUR',
    'CVXUSD',
    'DAIEUR',
    'DAIUSD',
    'DAIUSDT',
    'DASHEUR',
    'DASHUSD',
    'DASHXBT',
    'DENTEUR',
    'DENTUSD',
    'DOTETH',
    'DOTEUR',
    'DOTGBP',
    'DOTJPY',
    'DOTUSD',
    'DOTUSDT',
    'DOTXBT',
    'DYDXEUR',
    'DYDXUSD',
    'DYMEUR',
    'DYMUSD',
    'EGLDEUR',
    'EGLDUSD',
    'ENJEUR',
    'ENJGBP',
    'ENJJPY',
    'ENJUSD',
    'ENJXBT',
    'ENSEUR',
    'ENSUSD',
    'EOSETH',
    'EOSEUR',
    'EOSUSD',
    'EOSUSDT',
    'EOSXBT',
    'ETHAED',
    'ETHAUD',
    'ETHCHF',
    'ETHDAI',
    'ETHPYUSD',
    'ETHUSDC',
    'ETHUSDT',
    'ETHWETH',
    'ETHWEUR',
    'ETHWUSD',
    'EULEUR',
    'EULUSD',
    'EURAUD',
    'EURCAD',
    'EURCHF',
    'EURGBP',
    'EURJPY',
    'EURTEUR',
    'EURTUSD',
    'EURTUSDT',
    'EWTEUR',
    'EWTGBP',
    'EWTUSD',
    'EWTXBT',
    'FARMEUR',
    'FARMUSD',
    'FETEUR',
    'FETUSD',
    'FIDAEUR',
    'FIDAUSD',
    'FILETH',
    'FILEUR',
    'FILGBP',
    'FILUSD',
    'FILXBT',
    'FISEUR',
    'FISUSD',
    'FLOWETH',
    'FLOWEUR',
    'FLOWUSD',
    'FLOWXBT',
    'FLREUR',
    'FLRUSD',
    'FORTHEUR',
    'FORTHUSD',
    'FTMEUR',
    'FTMUSD',
    'FXSEUR',
    'FXSUSD',
    'GALAEUR',
    'GALAUSD',
    'GALEUR',
    'GALUSD',
    'GARIEUR',
    'GARIUSD',
    'GHSTEUR',
    'GHSTUSD',
    'GHSTXBT',
    'GLMREUR',
    'GLMRUSD',
    'GMTEUR',
    'GMTUSD',
    'GMXEUR',
    'GMXUSD',
    'GNOEUR',
    'GNOUSD',
    'GRTEUR',
    'GRTGBP',
    'GRTUSD',
    'GRTXBT',
    'GSTEUR',
    'GSTUSD',
    'GTCEUR',
    'GTCUSD',
    'HDXEUR',
    'HDXUSD',
    'HFTEUR',
    'HFTUSD',
    'HNTEUR',
    'HNTUSD',
    'ICPEUR',
    'ICPUSD',
    'ICXETH',
    'ICXEUR',
    'ICXUSD',
    'ICXXBT',
    'IDEXEUR',
    'IDEXUSD',
    'IMXEUR',
    'IMXUSD',
    'INJEUR',
    'INJUSD',
    'INTREUR',
    'INTRUSD',
    'JASMYEUR',
    'JASMYUSD',
    'JTOEUR',
    'JTOUSD',
    'JUNOEUR',
    'JUNOUSD',
    'JUPEUR',
    'JUPUSD',
    'KAREUR',
    'KARUSD',
    'KAVAETH',
    'KAVAEUR',
    'KAVAUSD',
    'KAVAXBT',
    'KEEPEUR',
    'KEEPUSD',
    'KEEPXBT',
    'KEYEUR',
    'KEYUSD',
    'KILTEUR',
    'KILTUSD',
    'KINEUR',
    'KINTEUR',
    'KINTUSD',
    'KINUSD',
    'KNCETH',
    'KNCEUR',
    'KNCUSD',
    'KP3REUR',
    'KP3RUSD',
    'KSMDOT',
    'KSMETH',
    'KSMEUR',
    'KSMGBP',
    'KSMUSD',
    'KSMXBT',
    'LCXEUR',
    'LCXUSD',
    'LDOEUR',
    'LDOUSD',
    'LINKAUD',
    'LINKETH',
    'LINKEUR',
    'LINKGBP',
    'LINKJPY',
    'LINKUSD',
    'LINKUSDT',
    'LINKXBT',
    'LMWREUR',
    'LMWRUSD',
    'LPTEUR',
    'LPTGBP',
    'LPTUSD',
    'LPTXBT',
    'LRCEUR',
    'LRCUSD',
    'LSKEUR',
    'LSKUSD',
    'LSKXBT',
    'LTCAUD',
    'LTCETH',
    'LTCGBP',
    'LTCUSDT',
    'LUNA2EUR',
    'LUNA2USD',
    'LUNAEUR',
    'LUNAUSD',
    'MANAEUR',
    'MANAUSD',
    'MANAUSDT',
    'MANAXBT',
    'MASKEUR',
    'MASKUSD',
    'MATICEUR',
    'MATICGBP',
    'MATICUSD',
    'MATICUSDT',
    'MATICXBT',
    'MCEUR',
    'MCUSD',
    'MINAEUR',
    'MINAGBP',
    'MINAUSD',
    'MINAXBT',
    'MIREUR',
    'MIRUSD',
    'MKREUR',
    'MKRUSD',
    'MKRXBT',
    'MNGOEUR',
    'MNGOUSD',
    'MOONEUR',
    'MOONUSD',
    'MOVREUR',
    'MOVRUSD',
    'MSOLEUR',
    'MSOLUSD',
    'MULTIEUR',
    'MULTIUSD',
    'MVEUR',
    'MVUSD',
    'MXCEUR',
    'MXCUSD',
    'NANOETH',
    'NANOEUR',
    'NANOUSD',
    'NANOXBT',
    'NEAREUR',
    'NEARUSD',
    'NMREUR',
    'NMRUSD',
    'NODLEUR',
    'NODLUSD',
    'NYMEUR',
    'NYMUSD',
    'NYMXBT',
    'OCEANEUR',
    'OCEANGBP',
    'OCEANUSD',
    'OCEANXBT',
    'OGNEUR',
    'OGNUSD',
    'OMGETH',
    'OMGEUR',
    'OMGJPY',
    'OMGUSD',
    'OMGXBT',
    'ONDOEUR',
    'ONDOUSD',
    'OPEUR',
    'OPUSD',
    'ORCAEUR',
    'ORCAUSD',
    'OXTEUR',
    'OXTUSD',
    'OXYEUR',
    'OXYUSD',
    'PAXGETH',
    'PAXGEUR',
    'PAXGUSD',
    'PAXGXBT',
    'PEPEEUR',
    'PEPEUSD',
    'PERPEUR',
    'PERPUSD',
    'PHAEUR',
    'PHAUSD',
    'POLEUR',
    'POLISEUR',
    'POLISUSD',
    'POLSEUR',
    'POLSUSD',
    'POLUSD',
    'PONDEUR',
    'PONDUSD',
    'POWREUR',
    'POWRUSD',
    'PSTAKEEUR',
    'PSTAKEUSD',
    'PYTHEUR',
    'PYTHUSD',
    'PYUSDEUR',
    'PYUSDUSD',
    'QNTEUR',
    'QNTUSD',
    'QTUMETH',
    'QTUMEUR',
    'QTUMUSD',
    'QTUMXBT',
    'RADEUR',
    'RADUSD',
    'RAREEUR',
    'RAREUSD',
    'RARIEUR',
    'RARIUSD',
    'RARIXBT',
    'RAYEUR',
    'RAYUSD',
    'RBCEUR',
    'RBCUSD',
    'RENEUR',
    'RENUSD',
    'REPV2ETH',
    'REPV2EUR',
    'REPV2USD',
    'REPV2XBT',
    'REQEUR',
    'REQUSD',
    'RLCEUR',
    'RLCUSD',
    'RNDREUR',
    'RNDRUSD',
    'ROOKEUR',
    'ROOKUSD',
    'RPLEUR',
    'RPLUSD',
    'RUNEEUR',
    'RUNEUSD',
    'SAMOEUR',
    'SAMOUSD',
    'SANDEUR',
    'SANDGBP',
    'SANDUSD',
    'SANDXBT',
    'SBREUR',
    'SBRUSD',
    'SCEUR',
    'SCRTEUR',
    'SCRTUSD',
    'SCUSD',
    'SCXBT',
    'SDNEUR',
    'SDNUSD',
    'SEIEUR',
    'SEIUSD',
    'SGBEUR',
    'SGBUSD',
    'SHIBEUR',
    'SHIBUSD',
    'SHIBUSDT',
    'SNXETH',
    'SNXEUR',
    'SNXUSD',
    'SNXXBT',
    'SOLETH',
    'SOLEUR',
    'SOLGBP',
    'SOLUSD',
    'SOLUSDT',
    'SOLXBT',
    'SPELLEUR',
    'SPELLUSD',
    'SRMEUR',
    'SRMUSD',
    'SRMXBT',
    'STEPEUR',
    'STEPUSD',
    'STGEUR',
    'STGUSD',
    'STORJEUR',
    'STORJUSD',
    'STORJXBT',
    'STRKEUR',
    'STRKUSD',
    'STXEUR',
    'STXUSD',
    'SUIEUR',
    'SUIUSD',
    'SUPEREUR',
    'SUPERUSD',
    'SUSHIEUR',
    'SUSHIUSD',
    'SYNEUR',
    'SYNUSD',
    'TBTCEUR',
    'TBTCUSD',
    'TBTCXBT',
    'TEEREUR',
    'TEERUSD',
    'TEUR',
    'TIAEUR',
    'TIAUSD',
    'TLMEUR',
    'TLMUSD',
    'TOKEEUR',
    'TOKEUSD',
    'TRUEUR',
    'TRUUSD',
    'TRXETH',
    'TRXEUR',
    'TRXUSD',
    'TRXXBT',
    'TUSD',
    'TUSDEUR',
    'TUSDUSD',
    'TVKEUR',
    'TVKUSD',
    'UMAEUR',
    'UMAUSD',
    'UNFIEUR',
    'UNFIUSD',
    'UNIETH',
    'UNIEUR',
    'UNIUSD',
    'UNIXBT',
    'USDAED',
    'USDCAUD',
    'USDCCAD',
    'USDCCHF',
    'USDCEUR',
    'USDCGBP',
    'USDCHF',
    'USDCUSD',
    'USDCUSDT',
    'USDTAUD',
    'USDTCAD',
    'USDTCHF',
    'USDTEUR',
    'USDTGBP',
    'USDTJPY',
    'USDTZUSD',
    'USTEUR',
    'USTUSD',
    'USTUSDC',
    'USTUSDT',
    'WAVESETH',
    'WAVESEUR',
    'WAVESUSD',
    'WAVESXBT',
    'WAXLEUR',
    'WAXLUSD',
    'WBTCEUR',
    'WBTCUSD',
    'WBTCXBT',
    'WEUR',
    'WIFEUR',
    'WIFUSD',
    'WOOEUR',
    'WOOUSD',
    'WUSD',
    'XBTAED',
    'XBTAUD',
    'XBTCHF',
    'XBTDAI',
    'XBTPYUSD',
    'XBTUSDC',
    'XBTUSDT',
    'XCNEUR',
    'XCNUSD',
    'XDGEUR',
    'XDGUSD',
    'XDGUSDT',
    'XETCXETH',
    'XETCXXBT',
    'XETCZEUR',
    'XETCZUSD',
    'XETHXXBT',
    'XETHZCAD',
    'XETHZEUR',
    'XETHZGBP',
    'XETHZJPY',
    'XETHZUSD',
    'XLTCXXBT',
    'XLTCZEUR',
    'XLTCZJPY',
    'XLTCZUSD',
    'XMLNXXBT',
    'XMLNZEUR',
    'XMLNZUSD',
    'XMRUSDT',
    'XREPZEUR',
    'XREPZUSD',
    'XRPAUD',
    'XRPETH',
    'XRPGBP',
    'XRPUSDT',
    'XRTEUR',
    'XRTUSD',
    'XTZEUR',
    'XTZUSD',
    'XTZUSDT',
    'XTZXBT',
    'XXBTZCAD',
    'XXBTZEUR',
    'XXBTZGBP',
    'XXBTZJPY',
    'XXBTZUSD',
    'XXDGXXBT',
    'XXLMXXBT',
    'XXLMZEUR',
    'XXLMZGBP',
    'XXLMZUSD',
    'XXMRXXBT',
    'XXMRZEUR',
    'XXMRZUSD',
    'XXRPXXBT',
    'XXRPZCAD',
    'XXRPZEUR',
    'XXRPZUSD',
    'XZECXXBT',
    'XZECZEUR',
    'XZECZUSD',
    'YFIEUR',
    'YFIUSD',
    'YGGEUR',
    'YGGUSD',
    'ZEURZUSD',
    'ZGBPZUSD',
    'ZRXEUR',
    'ZRXUSD',
    'ZRXXBT',
    'ZUSDZCAD',
    'ZUSDZJPY',
  ]

symbols = ['USD', 'USDC', 'USDT', 'XBT', 'XDG', 'ETH', 'SOL', 'LTC']


def filter_tickers(tickers, symbols):
    filtered_tickers = []
    patterns = [re.compile(f"({sym1}).*({sym2})|({sym2}).*({sym1})") for sym1 in symbols for sym2 in symbols if sym1 != sym2]

    for ticker in tickers:
        if any(pattern.search(ticker) for pattern in patterns):
            filtered_tickers.append(ticker)

    return filtered_tickers

filtered = filter_tickers(tickers, symbols)
print(filtered)
