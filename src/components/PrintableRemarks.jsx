import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react'
import { collection, doc, getDocs, query, where } from 'firebase/firestore'
import { db } from './Firebase';
import { DataGrid, GRID_STRING_COL_DEF, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { AppContext, ClassContext } from '../AppContext';
import { renderProgress } from './progress';
import { SparkLineChart } from '@mui/x-charts';
import { Box, Chip, colors, IconButton, Tab, Tabs } from '@mui/material';

export const PrintableRemarks = () => {
    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    }
    const { gridxcolumn, setgridxcolumn, gridxrow, setgridxrow, gridxgrouping, setgridxgrouping, } = useContext(AppContext);
    useEffect(() => {
        const timer = setTimeout(() => {
            print();
        }, 2000);

        // Cleanup function
        return () => clearTimeout(timer);
    }, [])
    return (
        <>
            <DataGrid
                rows={gridxrow}
                columns={gridxcolumn}
                pageSize={15}
                rowsPerPageOptions={[5]}
                // checkboxSelection
                disableSelectionOnClick
                disableColumnSelector
                rowHeight={25}
                columnGroupingModel={gridxgrouping}
                // slots={{
                //     toolbar: CustomToolbar,
                // }}
                sx={{
                    '& .MuiDataGrid-root': { fontSize: '10px' }, // Adjusts font size for all cells and headers
                    '& .MuiDataGrid-columnHeaders': { fontSize: '12px', fontWeight: 'bold' }, // Adjusts header font size
                }}
            />
        </>
    )
}
