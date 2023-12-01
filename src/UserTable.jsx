"use client";
import React, { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridToolbar,
} from "@mui/x-data-grid";
  

function UserTable() {
  const [Rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [selectionModel, setSelectionModel] = React.useState([]);
  
  
  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    setRows(Rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = Rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(Rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(Rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const deleteselectedRows = () => {
    let ans = window.confirm("Do you want to delete the selected rows ?");
    if (ans) {
      const filteredRows = Rows.filter(
        (row) => !selectionModel.includes(row.id)
      );
      setRows(filteredRows);
    }

    // console.log(selectionModel);
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      type: "string",
      flex: 0.5,
      weight: 100,
      align: "center",
      headerAlign: "center",
      editable: true,
    },
    {
      field: "email",
      headerName: "Email",
      type: "string",
      flex: 1,
      align: "center",
      headerAlign: "center",
      editable: true,
    },
    {
      field: "role",
      headerName: "Role",
      type: "string",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      );
      if (response.status === 200) {
        const res = await response.json();
        //  console.log(res);
        setRows(res);
      }
    } catch (error) {
      console.log(`Error in getting users data`);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ width: "100%", maxHeight: "100vh" }}>
      
      <DataGrid
        rows={Rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        pageSizeOptions={[5, 10]}
        checkboxSelection
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            csvOptions: { disableToolbarButton: true },
            printOptions: { disableToolbarButton: true },
            setRows,
            setRowModesModel,
            showQuickFilter: true,
          },
        }}
        onRowSelectionModelChange={setSelectionModel}
        rowSelectionModel={selectionModel}
      />
      <Button
        variant="outlined"
        color="error"
        sx={{ marginTop: "5px", position: "absolute", left: "15px", top : "10px" }}
        onClick={deleteselectedRows}
      >
        Delete {selectionModel.length} rows
      </Button>
    </div>
  );
}

export default UserTable;
