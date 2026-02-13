/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { UnityContext } from "react-unity-webgl";
import { useLocation } from "react-router";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { config } from "./config";

export interface BettedUserType {
  name: string;
  betAmount: number;
  cashOut: number;
  cashouted: boolean;
  target: number;
  img: string;
}

export interface UserType {
  balance: number;
  userType: boolean;
  img: string;
  userName: string;
  f: {
    auto: boolean;
    betted: boolean;
    cashouted: boolean;
    betAmount: number;
    cashAmount: number;
    target: number;
  };
  s: {
    auto: boolean;
    betted: boolean;
    cashouted: boolean;
    betAmount: number;
    cashAmount: number;
    target: number;
  };
}

export interface PlayerType {
  auto: boolean;
  betted: boolean;
  cashouted: boolean;
  betAmount: number;
  cashAmount: number;
  target: number;
}

interface GameStatusType {
  currentNum: number;
  currentSecondNum: number;
  GameState: string;
  time: number;
}

interface GameBetLimit {
  maxBet: number;
  minBet: number;
}

declare interface GameHistory {
  _id: number;
  name: string;
  betAmount: number;
  cashoutAt: number;
  cashouted: boolean;
  date: number;
}

interface UserStatusType {
  fbetState: boolean;
  fbetted: boolean;
  sbetState: boolean;
  sbetted: boolean;
}

interface ContextDataType {
  myBets: GameHistory[];
  width: number;
  userInfo: UserType;
  fautoCashoutState: boolean;
  fautoCound: number;
  finState: boolean;
  fdeState: boolean;
  fsingle: boolean;
  fincrease: number;
  fdecrease: number;
  fsingleAmount: number;
  fdefaultBetAmount: number;
  sautoCashoutState: boolean;
  sautoCound: number;
  sincrease: number;
  sdecrease: number;
  ssingleAmount: number;
  sinState: boolean;
  sdeState: boolean;
  ssingle: boolean;
  sdefaultBetAmount: number;
  myUnityContext: UnityContext;
}

interface ContextType extends GameBetLimit, UserStatusType, GameStatusType {
  state: ContextDataType;
  unityState: boolean;
  unityLoading: boolean;
  currentProgress: number;
  bettedUsers: BettedUserType[];
  previousHand: UserType[];
  history: number[];
  rechargeState: boolean;
  myUnityContext: UnityContext;
  currentTarget: number;
  setCurrentTarget(attrs: Partial<number>);
  update(attrs: Partial<ContextDataType>);
  getMyBets();
  updateUserBetState(attrs: Partial<UserStatusType>);
}

const unityContext = new UnityContext({
  loaderUrl: "/unity/AirCrash.loader.js",
  dataUrl: "/unity/AirCrash.data.unityweb",
  frameworkUrl: "/unity/AirCrash.framework.js.unityweb",
  codeUrl: "/unity/AirCrash.wasm.unityweb",
});

const init_state = {
  myBets: [],
  width: 1500,
  userInfo: {
    balance: 0,
    userType: false,
    img: "",
    userName: "",
    f: {
      auto: false,
      betted: false,
      cashouted: false,
      cashAmount: 0,
      betAmount: 20,
      target: 2,
    },
    s: {
      auto: false,
      betted: false,
      cashouted: false,
      cashAmount: 0,
      betAmount: 20,
      target: 2,
    },
  },
  fautoCashoutState: false,
  fautoCound: 0,
  finState: false,
  fdeState: false,
  fsingle: false,
  fincrease: 0,
  fdecrease: 0,
  fsingleAmount: 0,
  fdefaultBetAmount: 20,
  sautoCashoutState: false,
  sautoCound: 0,
  sincrease: 0,
  sdecrease: 0,
  ssingleAmount: 0,
  sinState: false,
  sdeState: false,
  ssingle: false,
  sdefaultBetAmount: 20,
  myUnityContext: unityContext,
} as ContextDataType;

const Context = React.createContext<ContextType>(null!);

const socket = io(config.wss);

export const callCashOut = (at: number, index: \"f\" | \"s\") => {
  let data = { type: index, endTarget: at };
  socket.emit(\"cashOut\", data);
};

let fIncreaseAmount = 0;
let fDecreaseAmount = 0;
let sIncreaseAmount = 0;
let sDecreaseAmount = 0;

let newState;
let newBetState;

export const Provider = ({ children }: any) => {
  const token = new URLSearchParams(useLocation().search).get(\"cert\");
  const [state, setState] = React.useState<ContextDataType>(init_state);

  newState = state;
  const [unity, setUnity] = React.useState({
    unityState: false,
    unityLoading: false,
    currentProgress: 0,
  });
  const [gameState, setGameState] = React.useState({
    currentNum: 0,
    currentSecondNum: 0,
    GameState: \"\",
    time: 0,
  });

  const [bettedUsers, setBettedUsers] = React.useState<BettedUserType[]>([]);
  const update = (attrs: Partial<ContextDataType>) => {
    setState({ ...state, ...attrs });
  };
  const [previousHand, setPreviousHand] = React.useState<UserType[]>([]);
  const [history, setHistory] = React.useState<number[]>([]);
  const [userBetState, setUserBetState] = React.useState<UserStatusType>({\n    fbetState: false,\n    fbetted: false,\n    sbetState: false,\n    sbetted: false,\n  });\n  newBetState = userBetState;\n  const [rechargeState, setRechargeState] = React.useState(false);\n  const [currentTarget, setCurrentTarget] = React.useState(0);\n  const updateUserBetState = (attrs: Partial<UserStatusType>) => {\n    setUserBetState({ ...userBetState, ...attrs });\n  };\n\n  const [betLimit, setBetLimit] = React.useState<GameBetLimit>({\n    maxBet: 1000,\n    minBet: 1,\n  });\n  React.useEffect(function () {\n    unityContext.on(\"GameController\", function (message) {\n      if (message === \"Ready\") {\n        setUnity({\n          currentProgress: 100,\n          unityLoading: true,\n          unityState: true,\n        });\n      }\n    });\n    unityContext.on(\"progress\", (progression) => {\n      const currentProgress = progression * 100;\n      if (progression === 1) {\n        setUnity({ currentProgress, unityLoading: true, unityState: true });\n      } else {\n        setUnity({ currentProgress, unityLoading: false, unityState: false });\n      }\n    });\n    return () => unityContext.removeAllEventListeners();\n  }, []);\n\n  React.useEffect(() => {\n    socket.on(\"connect\", () => {\n      socket.emit(\"enterRoom\", { token });\n    });\n\n    socket.on(\"bettedUserInfo\", (bettedUsers: BettedUserType[]) => {\n      setBettedUsers(bettedUsers);\n    });\n\n    socket.on(\"connect\", () => {\n      console.log(socket.connected);\n    });\n\n    socket.on(\"myBetState\", (user: UserType) => {\n      const attrs = userBetState;\n      attrs.fbetState = false;\n      attrs.fbetted = user.f.betted;\n      attrs.sbetState = false;\n      attrs.sbetted = user.s.betted;\n      setUserBetState(attrs);\n    });\n\n    socket.on(\"myInfo\", (user: UserType) => {\n      let attrs = state;\n      attrs.userInfo.balance = user.balance;\n      attrs.userInfo.userType = user.userType;\n      attrs.userInfo.userName = user.userName;\n      update(attrs);\n    });\n\n    socket.on(\"history\", (history: any) => {\n      setHistory(history);\n    });\n\n    socket.on(\"gameState\", (gameState: GameStatusType) => {\n      setGameState(gameState);\n    });\n\n    socket.on(\"previousHand\", (previousHand: UserType[]) => {\n      setPreviousHand(previousHand);\n    });\n\n    socket.on(\"finishGame\", (user: UserType) => {\n      let attrs = newState;\n      let fauto = attrs.userInfo.f.auto;\n      let sauto = attrs.userInfo.s.auto;\n      let fbetAmount = attrs.userInfo.f.betAmount;\n      let sbetAmount = attrs.userInfo.s.betAmount;\n      let betStatus = newBetState;\n      attrs.userInfo = user;\n      attrs.userInfo.f.betAmount = fbetAmount;\n      attrs.userInfo.s.betAmount = sbetAmount;\n      attrs.userInfo.f.auto = fauto;\n      attrs.userInfo.s.auto = sauto;\n      if (!user.f.betted) {\n        betStatus.fbetted = false;\n        if (attrs.userInfo.f.auto) {\n          if (user.f.cashouted) {\n            fIncreaseAmount += user.f.cashAmount;\n            if (attrs.finState && attrs.fincrease - fIncreaseAmount <= 0) {\n              attrs.userInfo.f.auto = false;\n              betStatus.fbetState = false;\n              fIncreaseAmount = 0;\n            } else if (\n              attrs.fsingle &&\n              attrs.fsingleAmount <= user.f.cashAmount\n            ) {\n              attrs.userInfo.f.auto = false;\n              betStatus.fbetState = false;\n            } else {\n              attrs.userInfo.f.auto = true;\n              betStatus.fbetState = true;\n            }\n          } else {\n            fDecreaseAmount += user.f.betAmount;\n            if (attrs.fdeState && attrs.fdecrease - fDecreaseAmount <= 0) {\n              attrs.userInfo.f.auto = false;\n              betStatus.fbetState = false;\n              fDecreaseAmount = 0;\n            } else {\n              attrs.userInfo.f.auto = true;\n              betStatus.fbetState = true;\n            }\n          }\n        }\n      }\n      if (!user.s.betted) {\n        betStatus.sbetted = false;\n        if (user.s.auto) {\n          if (user.s.cashouted) {\n            sIncreaseAmount += user.s.cashAmount;\n            if (attrs.sinState && attrs.sincrease - sIncreaseAmount <= 0) {\n              attrs.userInfo.s.auto = false;\n              betStatus.sbetState = false;\n              sIncreaseAmount = 0;\n            } else if (\n              attrs.ssingle &&\n              attrs.ssingleAmount <= user.s.cashAmount\n            ) {\n              attrs.userInfo.s.auto = false;\n              betStatus.sbetState = false;\n            } else {\n              attrs.userInfo.s.auto = true;\n              betStatus.sbetState = true;\n            }\n          } else {\n            sDecreaseAmount += user.s.betAmount;\n            if (attrs.sdeState && attrs.sdecrease - sDecreaseAmount <= 0) {\n              attrs.userInfo.s.auto = false;\n              betStatus.sbetState = false;\n              sDecreaseAmount = 0;\n            } else {\n              attrs.userInfo.s.auto = true;\n              betStatus.sbetState = true;\n            }\n          }\n        }\n      }\n      update(attrs);\n      setUserBetState(betStatus);\n    });\n\n    socket.on(\"getBetLimits\", (betAmounts: { max: number; min: number }) => {\n      setBetLimit({ maxBet: betAmounts.max, minBet: betAmounts.min });\n    });\n\n    socket.on(\"recharge\", () => {\n      setRechargeState(true);\n    });\n\n    socket.on(\"error\", (data) => {\n      setUserBetState({\n        ...userBetState,\n        [`${data.index}betted`]: false,\n      });\n      toast.error(data.message);\n    });\n\n    socket.on(\"success\", (data) => {\n      toast.success(data);\n    });\n    return () => {\n      socket.off(\"connect\");\n      socket.off(\"disconnect\");\n      socket.off(\"myBetState\");\n      socket.off(\"myInfo\");\n      socket.off(\"history\");\n      socket.off(\"gameState\");\n      socket.off(\"previousHand\");\n      socket.off(\"finishGame\");\n      socket.off(\"getBetLimits\");\n      socket.off(\"recharge\");\n      socket.off(\"error\");\n      socket.off(\"success\");\n    };\n  }, [socket]);\n\n  React.useEffect(() => {\n    let attrs = state;\n    let betStatus = userBetState;\n    if (gameState.GameState === \"BET\") {\n      if (betStatus.fbetState) {\n        if (state.userInfo.f.auto) {\n          if (state.fautoCound > 0) attrs.fautoCound -= 1;\n          else {\n            attrs.userInfo.f.auto = false;\n            betStatus.fbetState = false;\n            return;\n          }\n        }\n        let data = {\n          betAmount: state.userInfo.f.betAmount,\n          target: state.userInfo.f.target,\n          type: \"f\",\n          auto: state.userInfo.f.auto,\n        };\n        if (attrs.userInfo.balance - state.userInfo.f.betAmount < 0) {\n          toast.error(\"Your balance is not enough\");\n          betStatus.fbetState = false;\n          betStatus.fbetted = false;\n          return;\n        }\n        attrs.userInfo.balance -= state.userInfo.f.betAmount;\n        socket.emit(\"playBet\", data);\n        betStatus.fbetState = false;\n        betStatus.fbetted = true;\n        // update(attrs);\n        setUserBetState(betStatus);\n      }\n      if (betStatus.sbetState) {\n        if (state.userInfo.s.auto) {\n          if (state.sautoCound > 0) attrs.sautoCound -= 1;\n          else {\n            attrs.userInfo.s.auto = false;\n            betStatus.sbetState = false;\n            return;\n          }\n        }\n        let data = {\n          betAmount: state.userInfo.s.betAmount,\n          target: state.userInfo.s.target,\n          type: \"s\",\n          auto: state.userInfo.s.auto,\n        };\n        if (attrs.userInfo.balance - state.userInfo.s.betAmount < 0) {\n          toast.error(\"Your balance is not enough\");\n          betStatus.sbetState = false;\n          betStatus.sbetted = false;\n          return;\n        }\n        attrs.userInfo.balance -= state.userInfo.s.betAmount;\n        socket.emit(\"playBet\", data);\n        betStatus.sbetState = false;\n        betStatus.sbetted = true;\n        // update(attrs);\n        setUserBetState(betStatus);\n      }\n    }\n  }, [gameState.GameState, userBetState.fbetState, userBetState.sbetState]);\n\n  const getMyBets = async () => {\n    try {\n      const response = await fetch(`${config.api}/my-info`, {\n        method: \"POST\",\n        headers: {\n          \"Content-Type\": \"application/json\",\n        },\n        body: JSON.stringify({ name: state.userInfo.userName }),\n      });\n\n      if (response.ok) {\n        const data = await response.json();\n        if (data.status) {\n          update({ myBets: data.data as GameHistory[] });\n        }\n      } else {\n        console.error(\"Error:\", response.statusText);\n      }\n    } catch (error) {\n      console.log(\"getMyBets\", error);\n    }\n  };\n\n  useEffect(() => {\n    if (gameState.GameState === \"BET\") getMyBets();\n  }, [gameState.GameState]);\n\n  return (\n    <Context.Provider\n      value={{\n        state: state,\n        ...betLimit,\n        ...userBetState,\n        ...unity,\n        ...gameState,\n        currentTarget,\n        rechargeState,\n        myUnityContext: unityContext,\n        bettedUsers: [...bettedUsers],\n        previousHand: [...previousHand],\n        history: [...history],\n        setCurrentTarget,\n        update,\n        getMyBets,\n        updateUserBetState,\n      }}\n    >\n      {children}\n    </Context.Provider>\n  );\n};\n\nexport default Context;\n