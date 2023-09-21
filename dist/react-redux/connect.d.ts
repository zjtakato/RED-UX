import React from 'react';
export default function connect(mapStateToProps: any, mapDispatchToProps: any): (Component: React.FC) => (props: any) => React.JSX.Element;
