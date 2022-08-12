import {
  Alert,
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Checkbox,
  CircularProgress,
  Collapse,
  IconButton,
  IconButtonProps,
  Input,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Attachment,
  Bookmark,
  BookmarkAdded,
  BookmarkBorder,
  BookmarkRemove,
  Favorite,
  FileDownload,
  FileDownloadOutlined,
  FileDownloadRounded,
  FileDownloadDone,
  FileDownloadOff,
  Receipt,
  MoreVert,
  OpenInNewOutlined,
  Share,
  EditOutlined,
  EditOffOutlined,
  SaveOutlined,
  AttachFileOutlined,
  RestoreOutlined,
  CancelOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Dispatch, useEffect, useRef, useState } from "react";
import { red, common, green } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import { DateTime } from "luxon";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { instance } from "../../pages/_app";

const ExpandMore = styled((props: { expand: boolean } & IconButtonProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export const billCardTypes = [
  "AİDAT",
  "ELEKTRİK",
  "GAZ",
  "İNTERNET",
  "KİRA",
  "SU",
] as const;
export type billCardTypes = typeof billCardTypes[number];

export type Props = {
  date?: number;
  description?: string;
  editable?: boolean;
  id?: string;
  receipt?: string;
  saved?: boolean;
  type?: billCardTypes;
};

type States = {
  [key in keyof Props]: {
    set: Dispatch<Props[key]>;
    value: Props[key];
  };
};

const BillCard = (props: any) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null),
    [changed, setChanged] = useState(false),
    [expanded, setExpanded] = useState(false),
    [loading, setLoading] = useState(false),
    [savedHovered, setSavedHovered] = useState(false),
    [upload, setUpload] = useState<any>();
  const states = {} as States;
  for (const key in props) {
    const prop = props[key] as Props[keyof Props],
      [value, setValue] = useState(prop);

    // @ts-ignore
    states[key as keyof Props] = {
      set: function () {
        if (!changed && key !== "editable") setChanged(true);
        return setValue.apply(this, arguments);
      } as never,
      value: value as never,
    };
  }

  const dateTime = () =>
    DateTime.fromSeconds((states.date?.value as number) / 1000).toFormat(
      "LLLL, yyyy",
      {
        locale: "tr",
      }
    );

  useEffect(() => {
    if (loading) {
      const data = new FormData();
      // @ts-ignore
      for (const key in states) {
        const state = states[key as keyof Props];
        data.append(key, state?.value as any);
      }
      delete upload?.url;
      upload && data.append("file", upload);
      data.delete("editable");

      let request;

      request = instance["post"]("upload", data).then((res) => {
        console.log(res);
      });

      request.finally(() => {
        setChanged(false);
        setLoading(false);
        states.editable?.set(false);
      });
    }
  }, [loading]);

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={
          !states.editable?.value && (
            <Avatar sx={{ color: "text.primary", bgcolor: green["A700"] }}>
              <Receipt />
            </Avatar>
          )
        }
        action={
          !states.editable?.value && (
            <IconButton
              onClick={({ currentTarget }) => setAnchorEl(currentTarget)}
            >
              <MoreVert />
            </IconButton>
          )
        }
        title={
          (states.editable?.value && (
            <TextField
              disabled={loading}
              select
              label="Fatura Türü"
              value={states.type?.value}
              defaultValue={billCardTypes[0]}
              fullWidth
              sx={{ mb: "1rem" }}
              onChange={({ target: { value } }) =>
                states.type?.set(value as billCardTypes)
              }
            >
              {billCardTypes.map((type, index) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          )) ||
          states.type?.value
        }
        subheader={
          (states.editable?.value && (
            <DesktopDatePicker
              disabled={loading}
              label="Fatura Tarihi"
              inputFormat="MM/yyyy"
              value={dateTime()}
              onChange={(value: any) => states.date?.set(value.toSeconds())}
              renderInput={(params) => <TextField {...params} />}
            />
          )) ||
          dateTime()
        }
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            states.editable?.set(!states.editable?.value);
            setAnchorEl(null);
          }}
        >
          {!states.editable?.value && (
            <Button
              sx={{ backgroundColor: "transparent !important" }}
              startIcon={<EditOutlined />}
              onClick={() => states.editable?.set(!states.editable?.value)}
            >
              Düzenle
            </Button>
          )}
        </MenuItem>
      </Menu>

      <CardContent>
        {(states.editable?.value && (
          <TextField
            disabled={loading}
            label="Fatura Açıklaması"
            variant="standard"
            value={states.description?.value}
            onChange={({ target: { value } }) => states.description?.set(value)}
          />
        )) ||
          (states.description?.value && (
            <Typography variant="body2" color="text.secondary">
              {states.description?.value}
            </Typography>
          ))}
      </CardContent>

      <CardActions
        disableSpacing
        sx={{ "& .MuiIconButton-root span": { display: "flex" } }}
      >
        {(states.editable?.value && (
          <>
            <IconButton
              disabled={loading}
              sx={{ zIndex: 1 }}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "application/pdf";
                input.oninput = async () => {
                  const file = input?.files?.item(0) as File & {
                    url: string;
                  };
                  file.url = URL.createObjectURL(
                    new Blob([await file.arrayBuffer()], {
                      type: file.type,
                    })
                  );
                  setUpload(file);
                  input.remove();
                };
                input.click();
              }}
            >
              <Tooltip title="Dekont Yükle">
                <span>
                  <AttachFileOutlined />
                </span>
              </Tooltip>
            </IconButton>

            {upload && states.receipt?.value && (
              <IconButton disabled={loading} onClick={() => setUpload(false)}>
                <Tooltip title="Dekontu Geri Al">
                  <span>
                    <RestoreOutlined />
                  </span>
                </Tooltip>
              </IconButton>
            )}

            {(changed && (
              <IconButton
                disabled={loading}
                sx={{ ml: "auto" }}
                onClick={() => {
                  setExpanded(false);
                  setLoading(true);
                }}
              >
                <Tooltip title="Kaydet">
                  <span>
                    {(loading && <CircularProgress />) || <SaveOutlined />}
                  </span>
                </Tooltip>
              </IconButton>
            )) || (
              <IconButton
                sx={{ ml: "auto" }}
                onClick={() => {
                  setExpanded(false);
                  states.editable.set(false);
                }}
              >
                <Tooltip title="İptal">
                  <span>
                    <CancelOutlined />
                  </span>
                </Tooltip>
              </IconButton>
            )}
          </>
        )) || (
          <>
            <Tooltip title={(states.saved && "Remove") || "Save"}>
              <Checkbox
                sx={{ color: "white" }}
                icon={(savedHovered && <BookmarkAdded />) || <BookmarkBorder />}
                checkedIcon={
                  (savedHovered && <BookmarkRemove />) || <BookmarkAdded />
                }
                onChange={() => states.saved?.set(!states.saved.value)}
                onMouseEnter={() => setSavedHovered(true)}
                onMouseLeave={() => setSavedHovered(false)}
              />
            </Tooltip>
            <IconButton
              onClick={() => {
                const link = document.createElement("a");
                link.href = states.receipt?.value as string;
                link.download = "Fatura.pdf";
                link.target = "_blank";
                link.click();
                link.remove();
              }}
            >
              <Tooltip title="Dekontu İndir">
                <FileDownloadOutlined />
              </Tooltip>
            </IconButton>
            <IconButton target="_blank" href={states.receipt?.value as string}>
              <Tooltip title="Dekontu Aç">
                <OpenInNewOutlined />
              </Tooltip>
            </IconButton>
            <ExpandMore
              expand={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              <Tooltip title="Dekontu Göster">
                <ExpandMoreIcon />
              </Tooltip>
            </ExpandMore>
          </>
        )}
      </CardActions>
      {(states.editable?.value && upload && (
        <Collapse in={true} timeout="auto">
          <CardMedia component="iframe" height={"200vh"} src={upload.url} />
        </Collapse>
      )) || (
        <Collapse
          in={states.editable?.value ? !loading : expanded}
          timeout="auto"
        >
          <CardMedia
            component="iframe"
            height={"200vh"}
            src={
              (states.editable?.value && upload && upload.url) ||
              states.receipt?.value
            }
          />
        </Collapse>
      )}
    </Card>
  );
};

export default BillCard;
