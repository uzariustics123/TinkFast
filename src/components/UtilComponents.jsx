import { colors, Typography } from '@mui/material';
import React from 'react'

export function PerfstatsIndicator(props) {
    let myprop = {};
    if (props?.value == null) {
        return null;
    }
    else if (props?.value == 'INC') {
        myprop.style = {
            color: colors.yellow[900],
        };
    }
    else if (props?.value == 'F') {
        myprop.style = {
            color: colors.red[900],
        };
    }
    else if (props?.value == 'DR') {
        myprop.style = {
            color: colors.red[900],
        };
    }
    else if (props?.value == 'P') {
        myprop.style = {
            color: colors.green[800],
        };
    }
    else if (props?.value == 'WD') {
        myprop.style = {
            color: colors.red[800],
        };
    }
    else if (props?.value == 'C') {
        myprop.style = {
            color: colors.green[900],
        };
    }

    return <Typography sx={{ m: 2, flex: 1, fontWeight: 'bold', fontFamily: 'Open Sans', alignSelf: 'center' }} {...myprop} variant="caption">
        {props?.value}
    </Typography>;
}
