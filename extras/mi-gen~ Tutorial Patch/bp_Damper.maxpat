{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 7,
			"minor" : 3,
			"revision" : 5,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"rect" : [ 406.0, 113.0, 601.0, 635.0 ],
		"bglocked" : 0,
		"openinpresentation" : 1,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"objectsnaponopen" : 1,
		"statusbarvisible" : 2,
		"toolbarvisible" : 1,
		"lefttoolbarpinned" : 0,
		"toptoolbarpinned" : 0,
		"righttoolbarpinned" : 0,
		"bottomtoolbarpinned" : 0,
		"toolbars_unpinned_last_save" : 0,
		"tallnewobj" : 0,
		"boxanimatetime" : 200,
		"enablehscroll" : 1,
		"enablevscroll" : 1,
		"devicewidth" : 0.0,
		"description" : "",
		"digest" : "",
		"tags" : "",
		"style" : "",
		"subpatcher_template" : "",
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-37",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 245.0, 92.0, 119.0, 22.0 ],
					"style" : "",
					"text" : "definecolor 0 0 0.3 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-33",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 205.5, 5.0, 60.0, 22.0 ],
					"style" : "",
					"text" : "loadbang"
				}

			}
, 			{
				"box" : 				{
					"fontname" : "Arial",
					"fontsize" : 13.0,
					"id" : "obj-31",
					"linecount" : 2,
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 205.5, 37.0, 151.0, 38.0 ],
					"style" : "",
					"text" : "definerange -100 100, definethickness 3."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-29",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "float" ],
					"patching_rect" : [ 207.0, 123.0, 29.5, 22.0 ],
					"style" : "",
					"text" : "f 0."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-27",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 205.5, 157.0, 43.0, 22.0 ],
					"style" : "",
					"text" : "pak f i"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-23",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 64.0, 515.0, 50.0, 22.0 ],
					"style" : "",
					"text" : "0. 16"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-4",
					"linecount" : 8,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 410.0, 28.0, 155.0, 117.0 ],
					"presentation" : 1,
					"presentation_linecount" : 3,
					"presentation_rect" : [ 1.375, 208.0, 392.75, 48.0 ],
					"style" : "",
					"text" : "A damper interaction applies a linear damping force depending on the velocity between two masses. \nHere, a mass with an initial velocity is slowed down and stopped.\n"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-21",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "signal", "signal", "signal" ],
					"patching_rect" : [ 21.0, 110.0, 82.0, 22.0 ],
					"presentation" : 1,
					"presentation_linecount" : 2,
					"presentation_rect" : [ 279.25, 140.0, 66.0, 36.0 ],
					"style" : "",
					"text" : "gen~ damper"
				}

			}
, 			{
				"box" : 				{
					"fontface" : 1,
					"fontsize" : 14.0,
					"id" : "obj-8",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 421.0, 380.0, 188.0, 23.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 279.25, 87.0, 106.0, 23.0 ],
					"style" : "",
					"text" : "force(time)",
					"textcolor" : [ 0.784314, 0.145098, 0.023529, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"fontface" : 1,
					"fontsize" : 14.0,
					"id" : "obj-5",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 406.0, 365.0, 188.0, 23.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 278.0, 62.0, 106.0, 23.0 ],
					"style" : "",
					"text" : "position(time)",
					"textcolor" : [ 0.240323, 0.247547, 0.573641, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-22",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 21.0, 71.0, 35.0, 22.0 ],
					"style" : "",
					"text" : "reset"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-2",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 152.0, 251.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 279.25, 118.0, 62.0, 20.0 ],
					"style" : "",
					"text" : "the patch:"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.92549, 0.364706, 0.341176, 1.0 ],
					"bgcolor2" : [ 0.52549, 0.062745, 0.003922, 1.0 ],
					"bgfillcolor_angle" : 270.0,
					"bgfillcolor_autogradient" : 0.0,
					"bgfillcolor_color" : [ 0.290196, 0.309804, 0.301961, 1.0 ],
					"bgfillcolor_color1" : [ 0.92549, 0.364706, 0.341176, 1.0 ],
					"bgfillcolor_color2" : [ 0.52549, 0.062745, 0.003922, 1.0 ],
					"bgfillcolor_proportion" : 0.39,
					"bgfillcolor_type" : "gradient",
					"gradient" : 1,
					"id" : "obj-36",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 21.0, 27.0, 152.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 278.0, 29.0, 49.0, 22.0 ],
					"style" : "",
					"text" : "START"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-28",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patcher" : 					{
						"fileversion" : 1,
						"appversion" : 						{
							"major" : 7,
							"minor" : 3,
							"revision" : 5,
							"architecture" : "x64",
							"modernui" : 1
						}
,
						"rect" : [ 572.0, 179.0, 637.0, 480.0 ],
						"bglocked" : 0,
						"openinpresentation" : 0,
						"default_fontsize" : 12.0,
						"default_fontface" : 0,
						"default_fontname" : "Arial",
						"gridonopen" : 1,
						"gridsize" : [ 15.0, 15.0 ],
						"gridsnaponopen" : 1,
						"objectsnaponopen" : 1,
						"statusbarvisible" : 2,
						"toolbarvisible" : 1,
						"lefttoolbarpinned" : 0,
						"toptoolbarpinned" : 0,
						"righttoolbarpinned" : 0,
						"bottomtoolbarpinned" : 0,
						"toolbars_unpinned_last_save" : 0,
						"tallnewobj" : 0,
						"boxanimatetime" : 200,
						"enablehscroll" : 1,
						"enablevscroll" : 1,
						"devicewidth" : 0.0,
						"description" : "",
						"digest" : "",
						"tags" : "",
						"style" : "",
						"subpatcher_template" : "",
						"boxes" : [ 							{
								"box" : 								{
									"id" : "obj-5",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 254.0, 188.0, 136.0, 22.0 ],
									"style" : "",
									"text" : "definecolor 255 0 0 255"
								}

							}
, 							{
								"box" : 								{
									"fontname" : "Arial",
									"fontsize" : 13.0,
									"id" : "obj-79",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 2,
									"outlettype" : [ "", "" ],
									"patching_rect" : [ 83.5, 227.944702, 45.0, 23.0 ],
									"style" : "",
									"text" : "zl rev"
								}

							}
, 							{
								"box" : 								{
									"fontname" : "Arial",
									"fontsize" : 13.0,
									"id" : "obj-51",
									"linecount" : 2,
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 164.5, 238.0, 449.0, 38.0 ],
									"style" : "",
									"text" : "definerange -100 100, definethickness 2., definepoint none, defineline lines, defineygrid 0."
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-48",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 2,
									"outlettype" : [ "", "" ],
									"patching_rect" : [ 83.5, 197.5, 76.0, 22.0 ],
									"style" : "",
									"text" : "zl.stream 50"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-2",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 1,
									"outlettype" : [ "bang" ],
									"patching_rect" : [ 164.5, 139.0, 60.0, 22.0 ],
									"style" : "",
									"text" : "loadbang"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-39",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "float" ],
									"patching_rect" : [ 83.5, 169.944702, 82.0, 22.0 ],
									"style" : "",
									"text" : "* 200000000."
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-18",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "float" ],
									"patching_rect" : [ 83.5, 130.0, 35.0, 22.0 ],
									"style" : "",
									"text" : "* 0.3"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-17",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "float" ],
									"patching_rect" : [ 83.5, 100.0, 83.0, 22.0 ],
									"style" : "",
									"text" : "snapshot~ 10"
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-59",
									"index" : 1,
									"maxclass" : "inlet",
									"numinlets" : 0,
									"numoutlets" : 1,
									"outlettype" : [ "signal" ],
									"patching_rect" : [ 83.5, 40.0, 30.0, 30.0 ],
									"style" : ""
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-61",
									"index" : 1,
									"maxclass" : "outlet",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 83.5, 277.0, 30.0, 30.0 ],
									"style" : ""
								}

							}
 ],
						"lines" : [ 							{
								"patchline" : 								{
									"destination" : [ "obj-18", 0 ],
									"source" : [ "obj-17", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-39", 0 ],
									"source" : [ "obj-18", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-5", 0 ],
									"midpoints" : [ 174.0, 174.0, 263.5, 174.0 ],
									"order" : 0,
									"source" : [ "obj-2", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-51", 0 ],
									"order" : 1,
									"source" : [ "obj-2", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-48", 0 ],
									"source" : [ "obj-39", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-79", 0 ],
									"source" : [ "obj-48", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-61", 0 ],
									"midpoints" : [ 263.5, 225.0, 150.0, 225.0, 150.0, 264.0, 93.0, 264.0 ],
									"source" : [ "obj-5", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-61", 0 ],
									"midpoints" : [ 174.0, 279.0, 123.0, 279.0, 123.0, 264.0, 93.0, 264.0 ],
									"source" : [ "obj-51", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-17", 0 ],
									"source" : [ "obj-59", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-61", 0 ],
									"source" : [ "obj-79", 0 ]
								}

							}
 ]
					}
,
					"patching_rect" : [ 145.0, 157.0, 55.0, 22.0 ],
					"saved_object_attributes" : 					{
						"description" : "",
						"digest" : "",
						"globalpatchername" : "",
						"style" : "",
						"tags" : ""
					}
,
					"style" : "",
					"text" : "p render"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-12",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patcher" : 					{
						"fileversion" : 1,
						"appversion" : 						{
							"major" : 7,
							"minor" : 3,
							"revision" : 5,
							"architecture" : "x64",
							"modernui" : 1
						}
,
						"rect" : [ 572.0, 179.0, 637.0, 480.0 ],
						"bglocked" : 0,
						"openinpresentation" : 0,
						"default_fontsize" : 12.0,
						"default_fontface" : 0,
						"default_fontname" : "Arial",
						"gridonopen" : 1,
						"gridsize" : [ 15.0, 15.0 ],
						"gridsnaponopen" : 1,
						"objectsnaponopen" : 1,
						"statusbarvisible" : 2,
						"toolbarvisible" : 1,
						"lefttoolbarpinned" : 0,
						"toptoolbarpinned" : 0,
						"righttoolbarpinned" : 0,
						"bottomtoolbarpinned" : 0,
						"toolbars_unpinned_last_save" : 0,
						"tallnewobj" : 0,
						"boxanimatetime" : 200,
						"enablehscroll" : 1,
						"enablevscroll" : 1,
						"devicewidth" : 0.0,
						"description" : "",
						"digest" : "",
						"tags" : "",
						"style" : "",
						"subpatcher_template" : "",
						"boxes" : [ 							{
								"box" : 								{
									"id" : "obj-3",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 141.0, 193.0, 66.0, 22.0 ],
									"style" : "",
									"text" : "offset 0 $1"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-6",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 43.0, 193.0, 84.0, 22.0 ],
									"style" : "",
									"text" : "rect 0 0 48 48"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-2",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 1,
									"outlettype" : [ "bang" ],
									"patching_rect" : [ 43.0, 157.0, 60.0, 22.0 ],
									"style" : "",
									"text" : "loadbang"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-22",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "float" ],
									"patching_rect" : [ 141.0, 157.0, 38.0, 22.0 ],
									"style" : "",
									"text" : "+ 50."
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-18",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "float" ],
									"patching_rect" : [ 141.0, 130.0, 39.0, 22.0 ],
									"style" : "",
									"text" : "* -0.3"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-17",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "float" ],
									"patching_rect" : [ 141.0, 100.0, 83.0, 22.0 ],
									"style" : "",
									"text" : "snapshot~ 10"
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-59",
									"index" : 1,
									"maxclass" : "inlet",
									"numinlets" : 0,
									"numoutlets" : 1,
									"outlettype" : [ "signal" ],
									"patching_rect" : [ 141.0, 40.0, 30.0, 30.0 ],
									"style" : ""
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-60",
									"index" : 1,
									"maxclass" : "outlet",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 141.0, 246.0, 30.0, 30.0 ],
									"style" : ""
								}

							}
 ],
						"lines" : [ 							{
								"patchline" : 								{
									"destination" : [ "obj-18", 0 ],
									"source" : [ "obj-17", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-22", 0 ],
									"source" : [ "obj-18", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-6", 0 ],
									"source" : [ "obj-2", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-3", 0 ],
									"source" : [ "obj-22", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-60", 0 ],
									"source" : [ "obj-3", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-17", 0 ],
									"source" : [ "obj-59", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-60", 0 ],
									"source" : [ "obj-6", 0 ]
								}

							}
 ]
					}
,
					"patching_rect" : [ 21.0, 157.0, 55.0, 22.0 ],
					"saved_object_attributes" : 					{
						"description" : "",
						"digest" : "",
						"globalpatchername" : "",
						"style" : "",
						"tags" : ""
					}
,
					"style" : "",
					"text" : "p render"
				}

			}
, 			{
				"box" : 				{
					"data" : [ 12819, "png", "IBkSG0fBZn....PCIgDQRA..A....D..HX.....WxgpY....DLmPIQEBHf.B7g.YHB..f.PRDEDU3wY68tGebccbmm+py4buMdC9P7okk3CPPJYIGKSMNVYjSSGGJSIB.JlMcxN1Y2IwdFuIQiSlYc1cxN4S11XxLSV6IalGIi1M1YRhh2wxdaGIRzMnjHksYaKGaGG5GRjfhfOjHEo.IEoHHIHdz268Tyef6oYCPPQ.P.zMPWe+7o+PvF8iai9V0opeUcpKAgJMnToRoNwINgps1ZKpyN6zdydf6bm6b4VqcEQQQKG.qfYdYZsdEVqc0.Xw.X4w+aB.bWDQpo3wxQA.XlOOQzawL+1DQuIy7YTJ0EAv4.v4hhhNe2c28ktYuHISlz..rksrE66zmGg4dnx8APUNT5zoo8u+8qtYFGacqas95pqtkDEEsRkRc+LyahY99IhVEy7h.vhHhZ1yyCDQfYdL2.vX94ozAGQE+2RuoTJDEEgfffH.ze7sKPD8Z.33Vq8GaLlinTpyYLlKlISlnw+RmJUJE.PlLYr.XpevILif3.XtEB.vYzmOe9vw+.5niNVM.d.l42Ky78CfM.fMZLlFK9hLAF5LygDQLyLE+9Pk9dRNq4o.708ZT5+5toHhzk5TH94...q0Bl4SCfi.fixLe.l4evYO6Y64.G3.Ak99jLYRyxW9x4XmAk99ILKi3.XNfzoSqtYF7O1i8X2iRotW.7vDQagYdcDQM444AfQMjhuMQFGEMzmNF32tvLywNcJ83pniGkRQZstzHFFFiFovOfH5aBfen0Z6Y7oOjLYRijtvbChCfYGtog31d6suBl4O.QziwL+..Xi999KhY1spYwUzieJJLp887tuqh8LXIhrLyZkRoJMhgvvPDEE0KQzOA.6Uq0uvt28tOMJwYhjpvrKy6NopBGJYxj5wuRe6s296gY9iPD8yCfGVoTK1ExbTTDrVaHt9p4ksUzmsYboTXAf1XLjKklvvvBDQeal4uIy7y2c2cefRd5t+1FAwQvLFK3NIqLvDdhYas016G.OBQzuHy7l788qmY1Yv6L.bF5SU04WPPrCA2MhHRYLFPDgfffQ.vAYl+ZJk5E5pqt9Qk7TUISlTINCt8Qb.L8fRmNM0SO8Pkpv8i+3O95ihhdbl41.PReeepjb3cqxqVHt59LELyQ.fUJkQoTPoTnPgB1XMCxEEE8U1yd1yYcO9ToRoyjISQGpBSMjSDmhDeBWw7QSkJUyiLxHOJy7uD.9nFioN.fvvPWd7yaygubRIQGXIhLFiA..gggWhYtKl4m9AevGbeNgBSkJk9du26kEgCmZHmTN4PkJUpwrZ+1291uOkR8IXl2gmm25.JlOuy4frR+LDNwDwnUVPYLFmC1eHy7egmm2y7rO6y1GvnUbY7QlIbyQNA8clwKpG0d6suc.7IAv1MFim0ZQTTj6jMwneVlXmAQnDADCBBdKhnuD.9KxlM6g.DGASVjSVmXFyJ9Oxi7HKIQhD6D.eZkR8S4JgUb9pzznEaEtMoTADUJkVq0t9L3qBf+7b4x8RwOTJUpTJwQvDi3.Xr3TWNDXzdsOJJ5WwZs+y788WaTTDhhhJtBjrZeEC13lRRaLFWpX4zZ8me26d2eafQiH..PzHXrHm.OJiIT+N5niUas1m..+u344sz3v7Cwng3Kq1WghK8.mngQQQfYNKy7+24xkKOfHV33op2APxjIMNC+ToR07vCO7uk0Z+mmHQhkDFFBq0Jg4OOiRDMT444Qwoq0sRo9rc0UW+8.E+dupuOBpZc.TZ4715V2Z8IRj32..+ldddqsjtySByedNLyQtTCBBBJ.fmlHpyrYy9Z.hi.c49.nL.kNcZ0S9jOoE.niN53+QsV+k77793DQKNLLLbzzIIw3eA.DQJlY1ZsVhHOee+2WTTzu1F23F81zl1zOZu6cuCi3yIxmOeUmSfpoSvGSd9ae6a+CPD84LFyV..BCCkb7WfiSifQak.CJTnvI.vuetb49x.UmQCTU3.Hc5zpN6rSF.7N24NWdPPve..9jddd5ff.K.XhnpwngpJw4HPq0FhHDFF97DQ+NtdHHN8vphxFtf2APoh70d6s+OF.+gFiYUt53KF9UuvLaA.GuPvPDQ+gAAAe9m+4e9QFeKeuPkErN.J8KvG8QezVMFy+YsV+Qi2Qdh.eBEgYNRoTZiwfQFYjeLQzm10HQKziFXAoAv3V0+eNy7efmmWCwg6CIOegwiKs.iwXBCCsDQe9fffO6B8nAVP4.nzt8JdTa8exyyaqtx5QDYJ2GiBU13RKzyyCEJT3GYs1ei8rm878Q7V.egVCDsfwAPoq52Vas8qCf+HOOu5imbsxlzYRPoSA3aFtg5yT8OmS2ISb4fwEMPHQzuW1rY+7.i87rEBrPvnnX48hU3+Owyy6WRV0exiVOpNnQQQHLLDEJT.LySnCgIiygRMzYlgwXfmmGbCHzwO1xqTwoMfVqQXX3yEEE8I1yd1yYWHUtv40N.hKumqgd9vVq8uzyy6tiW0WZe2aADQvZs3pW8p..n4laFM1Xin4laF0UWcn95qG0TSMnt5pC999vyyC0We8S3qSPP.t5UuJXlw.CL.FYjQv0t10vPCMDt10tF5u+9w.CL.FXfAPM0TC777fwXfap+3FJpUZ3hFvyyyDDD7lDQ+pYylceXARJAyac.Tp5rs0Va+tJk5OjHBQQQxp9SBTJEFd3gQiM1Hd+u+2OV5RWJRjHAps1ZQCMzPQixaGbC6yQFYDLv.CfBEJfqd0qhye9yiyctygKdwKhAGbPL7vCiZqsVjHQhwbMOnRBl4PsVahcTkNWtb+qAl+Wkf4kN.b4gs8su8ESD8+qmm2ujTW+IOJkBCN3f3tu66FejOxGAKZQKpXz.tAW5L86mRoJl9P71pFCO7v37m+73BW3B3Lm4L3Mdi2.AAAvXLHQhDPq0EOlpDXbBD9L0VasehLYxb44y5BLeyAPw78iGIWYLFylDg9l7PDgBEJfUrhUf1ZqMzPCMffffa3wLSSoFwi+xLF.JlpvIO4IwoN0ovYNyYv.CL.pu95QoWjTJ2TZJAggguJ.9kylM6KOeUWf4SFLtiUt81aeG.3uTq0KNVkVIj+o.QQQHUpTXkqbknPgBEMBKG3bL3hR.XzAp5EtvEPe80Gd0W8UQe80GXlQ80WewHUJ2vLGFWkfAHh9GkMa1bnjyQKmGaSElWDtbo6Tq1au8OMQzSQDUaTTTjX7O4Qq03JW4JXKaYKnkVZAgggkUiefqGM.v0uLnQDglatYrxUtRzZqsh67NuSnTJb9yedL7vCCOOuYDMJtMOtUVqMTq00.fOVqs15k6s2d+d.i870Jcp3i.nTQVZu81+OZLle6378shJ+Sdh2zKn4laF+B+B+Bnt5pCQQQyJg6OSPoQFDWFNbwKdQbnCcHbnCcHL7vCiFZngxdDANcAhOF+SxkK2uEv7GwAqni.HYxjl8rm8Ds4MuYuMu4M+z999eRocdmdn0Zb0qdU7A+fePrl0rFDFFVwZ7CL1HCbNpZrwFwZVyZvZW6ZgmmGdy27MwHiLBRjHQ473TAL5zf2yy6mdCaXC2WiM13tdwW7ECSkJktmd5ohNRfJVG.NkUaqs1pqwFabudddOlH12zGq0hZqsV7vO7CiDIRLlF8oRmRSQfYFM1Xi3tu66Fqe8qGVqEm9zmF..999kqzBn3iuHee+6q95q+A2zl1TWO6y9rCWo6DnhzAfy3eG6XGuaq09h999+zAAAQxT5Y5gql+aXCa.2y8bOyqL9KEWTAtP9angFvZVyZvcdm2I5u+9w4O+4guueYQe.ZTTVqMvyyaiAAAO55W+5elt5pqARlLo4jm7jkekKm.p3b.TxJ+2Ey79888umvvv.QruoOJkBCLv.3gdnGBKaYKqnPayWozHBHhvRVxRv5W+5QSM0Ddi23MJlVPYJZ.cTTTfuu+6hYdqqe8q+Y95e8udEqSfJJG.kZ7CfuowXVWrwuW49Xa9LLyvyyCadyaFM1Xiy6c.3nTMBLFCV8pWMt669twUu5UwYNyYPM0TSY4yIQjNNRf2E.11F1vFdg8su8cwJQm.ULN.Fuwumm25hqwuX7eafS8+ktzkh669tO344MuMEfaFkFQPiM1HV25VGpqt5vwO9wAQDLFS4HZ.cTTTnwXVEy7ubrSfyVo4DnhPI8ToRocF+DQeiRV4WB6+1DmC.2F6Ygxp+SDtOqFiAO3C9f3W7W7WD0VasXvAGr3NdbN93wDFFFZLlURD00N24NWU974CSlLYEy40k8H.bk5qjv9Wurx+LGDQX3gGFuq206BaZSa5lV6+amUHqjbnTZz.KcoKEqcsqEW8pWEm9zmF0UWckCwAUVqMzyyaoEJT3i3zDnRo5.kUG.oRkRum8rmnToR0PXX32vyyaiQQQRN+yf3VUbwKdwXcqacS3u20S9t8quVqKdy0htkdekd+NCtwaXUtcJDuyPQc0UGV6ZWKHhvQO5QQs0Va43XQEEEE566uZmvfc0UWUDNAJaN.bWbNZqs1pKLL7ELFyCJq7O6fRoPgBEv5W+5QiM1H.PwgzAyLJTn.FYjQvfCNHFbvAw.CL.t10tFFbvAw4N24v4N24PPP.Fd3gKd+iLxHHHHnXDEtcuWoNE.l9SPnYBbkLTq03ttq6B0We83HG4Hv22eN+3I1IPPhDIdWLy+LaYKa4K8k9ReoxdyBUtbSSHdCSzd6s+rdddOdgBEjM0yrDts+66889dw8e+2Ohhhvktzkv0t10v.CL.txUtBFXfAJt27GbvAGyyszsJraB+T5vBogFZ.KdwKt3PDYwKdwnolZBJkp3P+vsEfcLWZ.5D8Tq0nmd5A6ae6qrseBXlCiGtHcmKWtN.fszAaybMkCG.E2wTs0VaOomm2uQPPfX7OKCQDFYjQfVqKpKPPP.zZ8MLcdJcCBMQqf6ldOtagggXjQFAJkB999v22GM1XiXEqXEX0qd0XwKdwn4laFMzPCEeMhux8NmuRrwXvwO9wQtb4J9Ytb3Dv222TnPg+hb4x8Iiu6hKJNWxbdJ.txfzd6s+Y77798h6seo8dmCvXLEy4OQhDnt5pC0TSMEMDJcZ7bqtAb8MpiuuewWKmZ6CMzP3bm6bnmd5Au5q9p3zm9z3sdq2pXM6877FSq6NW4LHJJB2wcbGXYKaY3HG4HiYlDLWgSS.OOuM2RKsn6s2d+lkqTAlSM5b05uiN5HEQz++wgUxhw+BOJcne3zYnPgB..n1ZqEszRKEai2ZqsVnTJDuKOm0cD3ZLpie7ii8rm8TLpn4xHAhOum0ZsJJJ5WKa1r+UkiIKzbVD.NE+aqs1d+Ly6lHxW1RuKrozHFzZMRjHQQA3N8oOMNxQNBd8W+0w.CL.788KN8ebOmYKGAtJDbG2wcfkrjkfCdvCBee+Yk2q2giAJd5BQLys0Zqs9s12912qMWGIvbhC.mh+Oxi7HKQq0ufwXVY7v7nr2GBBycTZ5CIRj.IRj.CMzP30e8WGG9vGF82e+Pq0ngFZ.999EEdb1vQPoNAZrwFQO8zCpolZlSiBH1IPT7vFcaszRKescu6ceo4Rm.yEFfja5nbO2y87U788eHQzOgwGYfVqQe80G5omdvEtvEfuuOZpollUcD3B6ekqbkvXLn2d6E0Vasy0NATVqMzXLMwL+OvUdPLGkd9rtC.m2r1au8N8779Thwuv3Y7QE3l7Ou0a8VnlZpAM0TSvXLE2FvyjNBbNhV8pWMFZngvoN0oJaNA788Wyku7kWUu81a14pwJ1rpC.Wa9t8su8GSoTeg3u.IQzOgIBmwnmmGRjHAd629sQO8zCt7kuLZpolPSM0TwG2L0oPtn.zZMV4JWIN6YOKt7kubQsHlqHtx.13JCblu3W7Kdf4hMNzrlCfzoSqdpm5oh14N24prV6yoTpFrVajH5mvshRa3HeeezWe8gibji.lYrzktzhapoYJGAtFcp1ZqEKe4KGG9vGFLykiAlpSTvstgMrgb6ae6quYa8.lsb.TLu+VZokuhmm2CHiuagoCLyEuhAczidT7lu4ahFarQr3Eu3hqdOS4DHJJBM0TSnwFaDG7fGrbjJ.wLGYLFel4elVas0+5csqcU.itqcmUNPlUb.37Z0Vas8uvyy6SGONuDiegoENivZqsVb0qdUbnCcH..rrksLjHQhYrs3rKRf63NtCTnPA7Zu1qUN0CXUVqco81aucmJUJ0rUT.y3N.biC4N5niGfY9KyLafj2uvL.tb0888wwN1wv4N24vxV1xPSM0zLVJAtP+W1xVFN8oOcYYVB3zCvXL+CZokVd0csqc8JyV5ALS+Ii5omdroSmV0We880777Vab89k79ElwfYF0Vas3RW5R3Ue0WEM0TSXoKcoyHoD3hBvsImdkW4UJWyWPmd.e3VZoku5K9hu3klMpLvLpC.Wn+M0TS+tFi4W0MIemIeODD.td67xLiCcnCAhHrpUsphkKblvIvhW7hwHiLBN0oN0btSfX8.B877ZfYds81auek74yOi+9LiYbNtP++uA.cba9Kg9KLqfKb8DIRfidzihgFZHr5Uu5YDcAboar3EuXbricLDEEUt1zPQddd2yF1vFNcu816OblNUfYJG.TO8ziE.n0VaMiwXjP+ElyfYF0UWc3Tm5T3se62FqZUqB0UWc2VNAJMU.iwfW8Ue047VEtzCGl4Gd1HUfYDCzjISpAF8B2owXd3vvPIzeg4ThhhPyM2LN4IOIxlMKtzktzs8z.14DXiabi3ttq6BEJTnrLIghqJvRTJ0e7L8q+ssQpqgehGpmOM.pSB8WnbfqmAtxUtBN8oOcww.1sSj.tWSeeebvCdvxRT.tpBn056ciabi87E9BegCMSkJvLYH5c544sTq0FJF+BkKbCBzKdwKhb4xcaGIfanptl0rFzZqshgFZnx5kTcq09419129hima.211Y2VeRRkJktyN6z1Vas8QTJ0uZPP.iJfQMtP0Mi2IvUtxUtsbBvLCeee79deuuwLWCmKojIK7ZUJ0+J.fToRca6I51wXk5omdroRkRGFF9k0Z86xZsx.9Pnh.Wn6W9xWFW5RWBqYMqo3VKdpFfpq+Bpu95wEtvEJtckKCBBRVqkXlenVas0r6ZW65Muc2q.SaiUm2mgGd3Oomm2GPD9SnRinnHTe80iicrig8u+8ivvvo8P.0ZsHQhD387ddOHLbNcpcUD2dEvyyi.Pm..Yxj41xKzz0fk5omdrczQGMxL+kIhVTbGXI49KTQgqqAO4IOIpolZvcdm24sUT.M1Xi3zm9zXfAFnrb4FCiVRP1XLarkVZ4mzau8d3amn.lVQ.3J6Gy7mw22eMQQQgRn+BUpDEEgEsnEg74yiie7iOsCeuzn.FbvAKKhAVxrDD.nyToR4mISlHLMEDbJ+IHtIDB6niNVMy7mNNbHw3WnhFWN76cu6Em+7m+1RTv2869ciEsnEgvvvx1ke7vvvHOOu26PCMz+Tfqun7TkorgaO8zCA.Xs1mv22eIwk8Sb.HTQiq0dGYjQP974KdgLYp3DvURvEu3EiVZoEL3fCVNuFHRwSXqemRJK3T1NbJ8DRmNsJSlLQs0VaaB.tU+Eg+DlWfq0dO9wONdkW4Ul1gvqTJrt0stxkF..XLkEbMDQOA.PpTolxdilR+Evs5O.dBee+Fkl9QX9Fto9y2869cQe802TNU.2jCZkqbkXIKYIksz.hQGuH7uYas01cLczBXp3.fh2seqlH5iKq9KLeEWO9+29292VLUfoBLynlZpAs1Zq3ZW6ZksNCjHhrVajmm2p.vuNvTu4flzO3RT9+SaLlEGOfOkU+El2ga.fdricLzau8BsVOkhBvomfa9CTl1gf.nnS..feysssssroZT.SJG.iS4+Oga7dOsNhEDp.vZsnwFaDeuu22Cu8a+1SIm.Nw.W1xVFV9xWdYYWBVBtYFvpLFymBXpUQfIkCfRT9+i466ubot+By2wM1w6u+9wAO3AmxOeq0h5qudrpUspxsN..i1bP..+pacqas9oxFEZRYDmISlnsssskfH5WOJJBhwuvBAhhhPCMz.d4W9kwEtvElVgyem24chfffYoivIGDQpvvvPOOuVps1Z+eBXxqEvs7AkLYRC.fwX9kzZ85ihhrSlmmfv7ATJEFZngvK+xuLhWbaJ87ui63NPc0UWYUGfXTLyvZsepjISZh0B3V+jtE+dpjqW4+OG+Gmx9mTAgYJrVKZngFvgNzgvktzklRZA35qfUu5UOsplvLIwQAvZs9AZt4leLfQ2t92pm263Qb5zoI.f1ZqsGRoT+7AAArri+DVnAQDBBBJdIAax9bbN.VwJVAFd3gK25...DE2cieR.fLYxXwsPKf2QG.kz3Oex3tdZV8BUnfP4.Wc8e0W8Uwku7kmxZAzbyMW1KGXL5vvPvL21N1wNte.vtEwuYbSc.3Z62N5niUCf1kR+IrPE20XfKdwKhSdxSNketKYIKo3vFobRIyK.k0Z+0.Fyh3SH2TG.6e+6WA.Xs1Gyyya4xX9VXgLNs.N7gO7jNedWZ.KYIKA0VaskcG.wPwWlz1w1111Z5V0XP2zOkNw+Hh9kq.BsQPXVEWeAzWe8gye9yOk1ofJkBKZQKZF6hT5sCkbwDYcZstcf24FC5l4.PA.r8su86iYdKwkGQD+SXAMtN760dsWaR+bbsE7RW5RQPPPY2APoPDkB.He972zRBNgN.RlLoB.PoTo777LLykmQgpfvbHtwG1oN0oJNxutUQAT5kPrxbKAWJp3tSbas2d6qEwWnQmvG3DbeT974CSlLYMLysKg+KTsfa7eelybFb4Ke4Icc8UJEZt4lKaiL7wiSLPiwjfY9iAbySC3F9D5ZgvlZpoMqTpGHLLzJg+KTsfSKfScpSMoyo28bpP5HvwyOOPQM8tgOL2TWbLyOVbs+q39DIHLagyX9zm9zS5UzcWCBpqt5lVsS7rDp3Y1QxN5niGDXh2e.2vcDW1.E.1oT6egpQ777P+82O5u+9mzUCPoTk0VAd7DmFPnuuOYs1O5M6wMli3zoSq..5niNd+LyqM9Ct3.PnpAmndNG.Sl49mq5ANQ.qfRCPEuHd6.EaM3w9.J8+TRy+7QSjHQMxL+SnZDmAc+82+jp4dHhvfCNHtxUtRYcPgNA3lVP2W6s296Ei1Zviwluz+iam+QDQeXY0egpUbaxm95quaYWA5bVb1yd1Jk8CPQhGWXg9990CfsBb8E4cbCexZqs1d2Lyen35HVQ4NSPXt.2dC3BW3B2RQ8b6jvSbhSfZqs1JJG.wPLyfYdK.2X0.J5.njcMzCo0Zel4JhFaVPnbfRovUtxUdGyq2oWvYNyYv4O+4gmmWknC.Ub0LRtyctykeC+R2OTRnAOZbHOUbeRDDlKwZsn+96+l96cq92SO8ToT5uaf3z.XsV2XXX3G.XLK1WzA.kOe9v34926qBzKlfvbJtU8uxUtxD96coIbxSdRb3CeXTe80Wora.mHrwKpuCfwpCfB35MHfwXduLyum3PFpbJpofPY.q0hqcsqcCqt6ZVnKe4KiW5kdoJosB7shGHUpT5R0APA.b9ye9QG1eL2ZhDILLyR4+DD.v.CLPQi6XwzfVqQgBEv2467cvEu3EqTy8uTTQQQfYt0AGbv6A35K5q..xmO+ns7GQ+rR2+IHLpwdc0UGNwINAtzktDRjHATJE788wvCOLxmOOdkW4UPCMzPE+p+kTNvFUJ08Bb8E8cg469DjTb.HHbcE9GbvAw2+6+8Qe80Gt5UuJN1wNFxlMKdkW4UPSM0TEyN.bRf6hGxCB.rksrkhF5D.3su8suNhnWVoT0asVVRAPPXTw.Gd3gguuOpolZJ1dv0TSMU7q7WJLyViwnhhhNP1rYeP28qb4Bn05MqTp5qvykQPXNE2PBgHBCMzPn95qGIRjXdkweLt1BtksssssL28oNwINwnE8m4ME2Jih.fBBkfyXWq0HdfaVlOhldDKhYCFi4A.FUHP0ANvABi+kuux6gmfPkMyWM7AFyHCWCfeJ.fSbhSnT.fSkJUCDQqI1SmT+eAgElvDQfH59..V25VmUA.bsqcskBfMEqnoD9ufvBSb5.rtsssskHSlLQNA.uSiwTGyrUx+WPXAKpXML1Xs0V6R.hC2mY99mOmeiffvsl3FBxp05kYs16.H1A.Qz8HW5uEDpNfHBQQQ2Kv0E7aCkwiGAAg4d1.v0c.rZIE.AgpBbUBXS..pN5niUyLuDYF.JHTUwcCLZD.q..KVb.HHTUfaFAtjToR4q.vRIhZPRAPPn5fXa8EUnPgUnrV6xiGnAxd.PPXgOtsEbi.XoJl4kEKJfDBffPU.LyPoTMFEEsbEQzJhyIPV8WPXANtMEjVqAQzhT35k.Tb.HHTcfM1APyJHU.PPnZCJdOAb2J.rboB.BBUk3qHhjl.RPn5BWk.d2JlYY.fHHTcgyAPcJ.rFlYH8.ffPUGjhHxTtOJDDDlSw0Nv2sD9ufPUHwQ8Wi3.PPnJj3L9shC.AgpTXlIwAffPULhC.AgpXDG.BBUwHN.DDphQb.HHTEi3.PPn5CNtLfmQIc.rfPUGts+6kUVq8Zk0CEAAg4ZH..hHihH5MTJEXYn.HHTsv0SAfY1H19BBUUvDQfY9JJ.bN4BCpfP0GDQWVQD8VhC.AgpJ33z96SwLeQoR.BBUUnhhh..thB.WPh.PPn5.lYlHRGFFBhnKo.vaHN.DDpdvI.n0ZunA.m0Zs.RWAJHTM.SixU0Z8aqTJ0aGDDvDQZoW.DDV3SbD+WcQKZQukhY97.3xhPfBBUE35Af9epm5oFVwLeN.bIQG.AgpJNE.fJWtbWfH5RJkBPb.HHrfm3IB7QAhE9iY90KqGQBBByUL53.1Z6E35J+eTQ+OAgpGTJUu..F..hnCFe+hRfBBKPItIfTgggCAf2DHNB.sVe3x5QlffvbAbrVeulVquBPrCffffyFFF1uRoTRu.HHrfEqVqAQzQ18t2c+.XzKLHEJTne.bLoR.BRbz5hD..PD9lDQAQEKbgHxMHPdM.fjISpUoRkRuu8suqQD8JwN.rkyCRAAgYd3QwDuIf9gt6Wc9yedmveGIN5eQHPAgEfnTJJLLbX.zC.vV1xVrpku7ky..Vq8GGDDXk8DffvBSHh.QzkKTnPO..c1YmVUlLYr..ddd+8.3JxdBPPXAIt7++AO+y+7if3H8UXTQ+ncsqccQ.bHQHPAgEjXUJEHh9t..oRkRADWFvzoS6lS3+shC.AgEjnhm6G+fwbm..6e+620RveGI8eAgEVvLa0ZsJHH3zFi4v..268duLPrCfsrksXA.BCCObXX3ETJklYVJGnfvBCXkRAkRcjm8Ye1SmNcZUmc140GCXc1YmL.nm64dtdAvQ0ZMfjFffvBEn3H6+d.iIh+h6FPNYxjiZ0y7e2b9gmffvrIDyLXl6F35Q7CTxf.0cmLy6RFRnBBKLfYlia.nSpTpCBTLhe.ThQt6NMFyO1Zs8oTJRZHHAg48DYLFnTp80UWcc0zoS6J8O.F6p7L.ncu6c2Oy79MFC.Pzb7AqffvLKtx+8R.iM+efwEluSG.kR8Mk8Effv7aXlYsVqhhhtf0ZeQ.f74yOlE0GiCf74yaA.hhh95AAA8GWNPIM.Ag4m3FA3+8c2c2mY7g+CbiB8YSmNsp6t69DDQGP5JPAg40Xic.7z..8zSO2PD82fR+tGDy7WQlO.BByOIV8eSPPvkQb9+tt+qTtAG.tGjwX9VEJTX.kRYjz.DDl2QTbC8806t6tOQoc+WobCN.5ryNsoSmVsqcsqdIhdQoZ.BByKQasVnTpL.Sb3+.2jl8w8fsV6yFEEA.nmsNJEDDlYw07OQQQuYTTzK..3l6GimIzAf6AaLlthhhNuzTPBByqHJNx8mo6t69RSj5+NtYs6KmNcZ0t28t6mHJijFffv7Chu3eXJTn.SD8U.t4g+C7Nzu+k7jdl3IIpHFnfPkOtY++2Ia1remzoSqxjIyMcw6apCf3mDkMa1uAy7OP1hvBByOHt1+++A7Nu5OvsXG+4laXLy+UwCTPwAffPEJwS9GcPPPeFi4qA.jISl2Qa12QG.tmr0ZelfffyJSJHAgJZrZsFLyO8t10ttXpToz3VzHe2p87uMYxjl8rm8bVhnmNVLPwAffPEFkz4eCZs1+LfIty+FO2xg9gaPgDEE8ECBBBDw.EDpHwFqS2tdtm6458l04eimaoC.WmAtm8rmCCf+FIJ.AgJKhK8mNJJBDQ+Y.2Zw+bLoF6WkrAg9uD+lHaSXAgJGrFiAVqMWWc0025VU5uRYR4.vURvb4x8RVqceRT.BBUTnhhh.y7mGXxu5OvTXve5JIH.9ihGwPxzBRPnLCybjmmGwLu2t6t6uMvMuu+mHlzN.bun4xkauVqcudddJlYo8fEDJS3x8OLLD.3yA.DW5uIc54SkQ+MG+hCq09GGuKAUhV.BBkMrFiALycmMa1uwTI2eGSoY+uSKft6t6WvZsunmmGAQK.Ag4bhW3UYsVn05OGvTK2eGS4K9GNs.Hh9CkJBHHT1v544QVq8qt6cu6uM.noRt+NlxN.xjIST5zoUwaRnulrUgEDlawk6ePPPgvvv+s..oSmlvzXu5bac4+xZscFFFNhzcfBByoD444Ahn+KO2y8buRpTozSlt9ahXZMpuxmOOmJUJ8t10tNWqs15J7779.VqMhHRtdBJHLKhaG+EFFdV.7w5s2dGLN2+o0BvSaCV2FMfY9+qfffyp0ZirSAEDl0gi2Z9+A4xk6BISlzfaCg3usZlmjISZxmOeXas01S3448mFDDDRDYtcdMEDDlXXliLFiNLL76jKWtGN9tm1q9CbapAf65LVtb4dxfffuummmQZNHAgYGHhzwcg6uKvTuoelHtcyYmK4f32Id1AJkETPXFFl4POOO.f+zb4x8RoRkROUa5mIhaaQ6xjISTpToz4xk6kXl+SjxBJHLyRrvelBEJbRkR8YAlbC6iICyHp16NXJTnvmMHH30EAAEDlU3yrqcsqKlLYRyzsreimYDG.c1Ym1jISZ16d26aqTp+WiUoTPP31j3P+UVq8uLWtb+MoSmVkOe9vYpW+Yr51mOe9vToRo6pqtd1vvv+q999Jl4YrCTAgpMbg9GFFdpfff+kyFuGynMtSIWYg+WVnPgSJoBHHL8HVHcWnz+VO+y+7u0LYn+NlwiUujdC3QTJ0KvL65cYIu.AgIIwg9aBCCexrYy9DyTp9Odlwup+dxSdRabaBerVas058779GFEEIsIrfvjj3F9wDFF9xKcoKM0O4m7SB6omdlUdulUtre6NXW0pV02zXLeTiwbWxdEPP3VCyrUoTZq0NhwX1wW8q9UeiToRo6omdlURkd1xfjSkJkNe97gJk5SDFF1ubUERPXRAGe0842dW6ZWGHYxjlYiP+cLqshblLYhRlLooqt5pG.7DJ0nuURWBJHLwvLG566qCCC+R4xk6OKtjeypMU2rRJ.NN4IOoMc5zpu3W7K9xszRKK022+CJ5AHHbivLGZLFSPPvOB.+B81auA4ymGXV9Bx6bgx7E2sRs2d6unwX9HxtFTP35vLGo0ZcTTzUTJ0C0UWc0yrkp+im4hUhKNMgAvGOHH30h6O.Y+BHT0ia7dEmY7mnqt5pmY679Kk4jPwc5AjMa1yYs1eknnnPQTPAA.b8KqW+ejKWt+Fm34yUu4yoMmSIMIzGSq0+2rVqzjPBUyD3444UnPg+q4xk6eBtt83blP4yohw41u.4xk6KGFF9uJdqCyRkADpBwY7+hwF+S6I66sCypUAXhHtIgnidzi9saokVVguu+GPpLfP0Dws4qWPPvKyLu8idziNbpTozO4S9jy4oDOm6.HFB.n2d6s60u90euddd2eTTTn3DPXgNwJ9aBCC6iH5QykK2aNWo3+DQ4xfiSmNsB.nu956WIHH3aEOOAksOrvBVbk6yZsWhHZaYyl8XykJ9OQTVEey44aqacq0mHQhWvXL+CCCCkdDPXAGLyQw83e..ZKWtb60IJd473prFxsadBtu8suqUas0tsfffermmmA.AkyiKAgYRJ03mYt8JEiefxbD.NbQB7XO1ic2Zs9qaLl0GFFF..ux8wlfvsCi23u6t69EpTL9AJyQ.3vEIvd1ydNIy7OWPPvILFimnIfv7YpzM9ApPh.vQIMJzcAfc4448.x9FPX9HSjw+l27l8NvANPEU5sUDQ.3He97gISlzjKWtSAfGNHH36HUGPX9F2rU9qzL9Apvb..LFm.CFKLnThPg4M3J0GybEaX+kREmC.fq2xvYxjYfZqs1etvvvupuuugYNRZaXgJXBLFiNJJ5rQQQenJciefJLM.FOk1gTs2d6+mLFyuUXXHXlsRWCJTIgaJ9FDDbbhncjMa1CUoa7CT9ZE3IE8zSOb7.Qj6s2de9MrgMLrRo94IhHlYY+CHT1INhzHeeeSXX320Zsezt6t6Wayadyde2u62sh13GnBMEfRINB.Jc5zprYy94rV6+CVqc337rp3+CrvBWbyyh3U9+ZAAAe38rm8b1JUA+lHpnSAXbPoRkRkISlnsu8s+AHhdZOOu0EDDDA.kLSADlKwozOQDrV6eb1rY+L.iMs04CTwGAPIvtIKT2c28eGQzOSXX3d877z.W2arfvrMLygwapmHq09q4L9SmNsZ9jwOv7qH.JRohqzVas8Go05OC.P7VJVZZHgYEb46GGx+IAv+3b4xkOc5zpN6rSFywCyiYBpnEA7lgabimOedt2d6cus1ZqG1Zsa0yyqtnnnP.PRJAByjDGgIEO29eNhn1xkK2gRlLo4odpmZd0p9kx7cijh5Bzd6s2h0ZeJee+el3REFQDMuzAmPkEwg7ahuP29uNa1roAFajnyWYduARO8zCmLYRyd26duvpW8p+qMFSBkR8vJkRYsVYJCILsINjea7Uo2yYs1e4b4x8EAFMe+4yq76X9dD.EYbMMzVYl+y788WagBEX.vhi.goBLygJkxn0ZDFFtKq09Oq6t69LwmmYw7v78mHVv3.HlRKU3hUJ0+NkR8qCLp.g.PKZCH7NgaU+3V5cD.76lMa1+i.KLB4e7rfzXXbQCzFy7+Aee+VBBBDsADto3V02XLHHHHe7p9GDi1HZTmc14BtRMufzA.vn4n0SO8PYxjIZG6XGKxZs+aIh9MUJEBCCivnUJPRKPvovO644oKTnvvDQ+elKWt+8.EW0OBKPB4e7rf0AfiRiFniN53m0Zs+68779.QQQvZsRZAUw3pquVqMJkBAAA6gH5+8rYydHf4ec02zgpkS7ojIS5tlqQs2d6OAy7uuuu+xkzBpNw8cdb39uIQzuW1rY+q.V3upeoT0bR+IO4Isw6rPau816e2l1zl9xggg0Af2ummmNJJxB.YaFu.G2UkZ224Ly++Xs1Od2c28KgQEQVum8rmEzq5WJUKQ.LFJUM2G+we7MGEEkVoTsGGFnSnGoaBW.gKOeiwnA.hhhdNq0962c2ce.fElJ7OYnp8D7REID.n81aeG.3ynTpODQDBCCYLZDAUMQIsPDmguVq0wN3eYl4Oa2c28yBTLOeF.K3T3exPUqC.GiuwN5niN5fY9+MkR8vwNBb+NYKGOOhIvv+j.3eyUu5U+qbZA45Yjx7gZYE4D5XFuhus0VaON.9Wn05e13RG5xeTbDTAyDX3+5DQ+o0TSM+4Yxj4x.UGp6OYQNQdr3VUnXDAs2d66fY92lH5CaLFTR4CUhfgUNDOcnzFighib6nLyeAsV+mu6cu69AptT2exh3.3lvDDQPR.7D.3w788qOJJBQQQQXz+FJBFVFvsZuqbdVqEQQQuLQzeLQzyzUWccUfaLMOgqibR66L2PDAO5i9nsp05OA.R444sNlYXsVTxNOThJXVFWo7JILeF.cSD8mmMa1c6dbhg+sFwAvjCJUpTp68duW10O3oRkp4gFZnN.vmfH5g777RDmdfKbTIEgYPbF8DQZsVi3v7OCy7yvL+Ttx4AHF9SEDG.ScTISlTUZMi6niNd.l4c.f+QDQs5zJHNEA.IMgoLwsoq6FYLFUrQOXl+F.3oqs1ZelLYx71wOkR61SgIIxIjSetgnB9TepOk2a9lu4OKQzGmY9CYLlVhmZrvZs..ALyZIxfaNwqzyDQF2J8w+86GxL+MIh9qylM6K6d7oRkRG+cv7xYxW4FwAvL.oRkRCT7ZX...djG4QVhuu+OMQzNYl2JQzZ788cQFTT.q3GdUYoEc6893+KQDozZMzZMFYjQh.Pu.3EIh9pW4JW4.4ymeX2yUTzelgptS5lkgRmNMs+8u+wjhPxjIMM1Xi+bLyeH.7yQD8AcgzxL6bHDh3TEhugERNEJ4Z5XwP6KcU93+ND.fuOy72F.uPtb49VnDC7jISZ1xV1hcg39xubwBlSvp.QkJUJpzTD.FMMg95qu6D.IAvVYluOhnM544kHdnS5DRrX3vXzumlWEkPI4vaA.HhLDQfHBJkBDQnPgBg.3H.3P.3ap05mu+96+zk57rjV1VD0aVf4MmPMemToRoO+4OOMdQpRkJUsCMzP2CQz8SD8fLyODy7FAP8dddToZHXiERHlRMFlSiZXbqlW5+V78VMJPoFUtivvPXs1g.voHhbqx+Sps1ZOblLYFnzW+jISZV9xWNKcq2rOhCf4dHLp.hzD4P..Xaaaa2ouu+Ok0ZuGhn2Ky76F.aRq0qzYe69WWTCkbyB.WCJU78CWORhIy24EUeuje1c+Toql6t4NVbDFFdUL5p6uF.NHybOZs9U5pqtNx3eyJwf24fSVoeNBwAP4GJUpTJ.fwmtfiMu4M6cW20ccGiLxHKRq02CybqDQqG.afYdo.nY.rH.zfwXHWWwAbcGDNJ8mmHXlGiQco+rRof0ZckhaPl4KCf9Ih5mY9D.3nDQGmY9HZs9rCN3fu89129t16zmYIz9xKhCfJSnToRoNwINgZcqac12oPgSmNs5G8i9QqLJJZYZsdILyMYs1kpTpUxL2LQTS.3cAfPl4li+4I9MkHF.Zq09VJk5b.v.fqxLeZ.LB.NkRoFfY9hDQWJLL7st10t14JUc9I.0l27l0weNpZ21sUp7eG3cakK98K4SD.....jTQNQjqBAlf" ],
					"embed" : 1,
					"id" : "obj-15",
					"maxclass" : "fpic",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "jit_matrix" ],
					"patching_rect" : [ 115.25, 228.0, 52.5, 172.0 ],
					"pic" : "MI_MAT_Base_Plan.png",
					"presentation" : 1,
					"presentation_rect" : [ 83.25, 13.0, 52.5, 172.0 ],
					"yoffset" : 63.224279
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-6",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "float" ],
					"patcher" : 					{
						"fileversion" : 1,
						"appversion" : 						{
							"major" : 7,
							"minor" : 3,
							"revision" : 5,
							"architecture" : "x64",
							"modernui" : 1
						}
,
						"rect" : [ 572.0, 179.0, 637.0, 480.0 ],
						"bglocked" : 0,
						"openinpresentation" : 0,
						"default_fontsize" : 12.0,
						"default_fontface" : 0,
						"default_fontname" : "Arial",
						"gridonopen" : 1,
						"gridsize" : [ 15.0, 15.0 ],
						"gridsnaponopen" : 1,
						"objectsnaponopen" : 1,
						"statusbarvisible" : 2,
						"toolbarvisible" : 1,
						"lefttoolbarpinned" : 0,
						"toptoolbarpinned" : 0,
						"righttoolbarpinned" : 0,
						"bottomtoolbarpinned" : 0,
						"toolbars_unpinned_last_save" : 0,
						"tallnewobj" : 0,
						"boxanimatetime" : 200,
						"enablehscroll" : 1,
						"enablevscroll" : 1,
						"devicewidth" : 0.0,
						"description" : "",
						"digest" : "",
						"tags" : "",
						"style" : "",
						"subpatcher_template" : "",
						"boxes" : [ 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-1",
									"index" : 3,
									"maxclass" : "outlet",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 254.5, 311.0, 30.0, 30.0 ],
									"style" : ""
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-3",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 141.0, 193.0, 66.0, 22.0 ],
									"style" : "",
									"text" : "offset 0 $1"
								}

							}
, 							{
								"box" : 								{
									"fontname" : "Arial",
									"fontsize" : 13.0,
									"id" : "obj-79",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 2,
									"outlettype" : [ "", "" ],
									"patching_rect" : [ 243.5, 183.944702, 45.0, 23.0 ],
									"style" : "",
									"text" : "zl rev"
								}

							}
, 							{
								"box" : 								{
									"fontname" : "Arial",
									"fontsize" : 13.0,
									"id" : "obj-51",
									"linecount" : 2,
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 165.5, 228.0, 449.0, 38.0 ],
									"style" : "",
									"text" : "definerange -100 100, definethickness 2., definepoint none, defineline lines, defineygrid 0."
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-48",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 2,
									"outlettype" : [ "", "" ],
									"patching_rect" : [ 243.5, 153.5, 76.0, 22.0 ],
									"style" : "",
									"text" : "zl.stream 50"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-6",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 50.0, 142.5, 84.0, 22.0 ],
									"style" : "",
									"text" : "rect 0 0 48 48"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-2",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 1,
									"outlettype" : [ "bang" ],
									"patching_rect" : [ 58.0, 109.0, 60.0, 22.0 ],
									"style" : "",
									"text" : "loadbang"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-39",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "float" ],
									"patching_rect" : [ 243.5, 125.944702, 33.0, 22.0 ],
									"style" : "",
									"text" : "* -1."
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-22",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "float" ],
									"patching_rect" : [ 141.0, 157.0, 38.0, 22.0 ],
									"style" : "",
									"text" : "+ 50."
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-18",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "float" ],
									"patching_rect" : [ 141.0, 130.0, 39.0, 22.0 ],
									"style" : "",
									"text" : "* -0.3"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-17",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "float" ],
									"patching_rect" : [ 141.0, 100.0, 83.0, 22.0 ],
									"style" : "",
									"text" : "snapshot~ 10"
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-59",
									"index" : 1,
									"maxclass" : "inlet",
									"numinlets" : 0,
									"numoutlets" : 1,
									"outlettype" : [ "signal" ],
									"patching_rect" : [ 141.0, 40.0, 30.0, 30.0 ],
									"style" : ""
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-60",
									"index" : 1,
									"maxclass" : "outlet",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 141.0, 311.0, 30.0, 30.0 ],
									"style" : ""
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-61",
									"index" : 2,
									"maxclass" : "outlet",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 198.5, 311.0, 30.0, 30.0 ],
									"style" : ""
								}

							}
 ],
						"lines" : [ 							{
								"patchline" : 								{
									"destination" : [ "obj-18", 0 ],
									"source" : [ "obj-17", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-22", 0 ],
									"order" : 1,
									"source" : [ "obj-18", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-39", 0 ],
									"order" : 0,
									"source" : [ "obj-18", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-51", 0 ],
									"order" : 0,
									"source" : [ "obj-2", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-6", 0 ],
									"order" : 1,
									"source" : [ "obj-2", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-3", 0 ],
									"source" : [ "obj-22", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-60", 0 ],
									"source" : [ "obj-3", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-1", 0 ],
									"order" : 0,
									"source" : [ "obj-39", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-48", 0 ],
									"order" : 1,
									"source" : [ "obj-39", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-79", 0 ],
									"source" : [ "obj-48", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-61", 0 ],
									"source" : [ "obj-51", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-17", 0 ],
									"source" : [ "obj-59", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-60", 0 ],
									"source" : [ "obj-6", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-61", 0 ],
									"source" : [ "obj-79", 0 ]
								}

							}
 ]
					}
,
					"patching_rect" : [ 82.0, 157.0, 55.0, 22.0 ],
					"saved_object_attributes" : 					{
						"description" : "",
						"digest" : "",
						"globalpatchername" : "",
						"style" : "",
						"tags" : ""
					}
,
					"style" : "",
					"text" : "p render"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-10",
					"maxclass" : "fpic",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "jit_matrix" ],
					"patching_rect" : [ 21.0, 228.0, 52.5, 172.0 ],
					"pic" : "MI_MAT_Ground_Plan.png",
					"presentation" : 1,
					"presentation_rect" : [ 14.25, 13.0, 52.5, 172.0 ],
					"yoffset" : 50.0
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 1.0, 1.0, 1.0, 0.01 ],
					"gridorigincolor" : [ 0.0, 0.0, 0.0, 0.0 ],
					"id" : "obj-11",
					"maxclass" : "plot~",
					"numinlets" : 1,
					"numoutlets" : 1,
					"numpoints" : 2,
					"outlettype" : [ "" ],
					"patching_rect" : [ 21.0, 198.5, 141.0, 212.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 22.25, -15.5, 108.0, 212.0 ],
					"subplots" : [ 						{
							"color" : [ 0.0, 0.0, 0.3, 1.0 ],
							"thickness" : 3.0,
							"point_style" : "dot",
							"line_style" : "lines",
							"number_style" : "none",
							"filter" : "none",
							"domain_start" : 0.0,
							"domain_end" : 1.0,
							"domain_style" : "linear",
							"domain_markers" : [  ],
							"domain_labels" : [  ],
							"range_start" : -100.0,
							"range_end" : 100.0,
							"range_style" : "linear",
							"range_markers" : [ 0.0 ],
							"range_labels" : [  ],
							"origin_x" : 0.0,
							"origin_y" : 0.0
						}
 ],
					"thinmode" : "none"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 1.0, 1.0, 1.0, 0.01 ],
					"id" : "obj-32",
					"margins" : [ 8.0, 8.0, 8.0, 82.0 ],
					"maxclass" : "plot~",
					"numinlets" : 1,
					"numoutlets" : 1,
					"numpoints" : 50,
					"outlettype" : [ "" ],
					"patching_rect" : [ 82.0, 198.5, 228.0, 212.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 48.0, -15.5, 228.0, 212.0 ],
					"subplots" : [ 						{
							"color" : [ 0.4, 0.4, 0.75, 1.0 ],
							"thickness" : 2.0,
							"point_style" : "none",
							"line_style" : "lines",
							"number_style" : "none",
							"filter" : "none",
							"domain_start" : 0.0,
							"domain_end" : 1.0,
							"domain_style" : "linear",
							"domain_markers" : [  ],
							"domain_labels" : [  ],
							"range_start" : -100.0,
							"range_end" : 100.0,
							"range_style" : "linear",
							"range_markers" : [ 0.0 ],
							"range_labels" : [  ],
							"origin_x" : 0.0,
							"origin_y" : 0.0
						}
 ],
					"thinmode" : "none"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 1.0, 1.0, 1.0, 0.01 ],
					"id" : "obj-30",
					"margins" : [ 8.0, 8.0, 8.0, 82.0 ],
					"maxclass" : "plot~",
					"numinlets" : 1,
					"numoutlets" : 1,
					"numpoints" : 50,
					"outlettype" : [ "" ],
					"patching_rect" : [ 82.0, 198.5, 228.0, 212.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 48.0, -15.5, 228.0, 212.0 ],
					"subplots" : [ 						{
							"color" : [ 255.0, 0.0, 0.0, 255.0 ],
							"thickness" : 2.0,
							"point_style" : "none",
							"line_style" : "lines",
							"number_style" : "none",
							"filter" : "none",
							"domain_start" : 0.0,
							"domain_end" : 1.0,
							"domain_style" : "linear",
							"domain_markers" : [  ],
							"domain_labels" : [  ],
							"range_start" : -100.0,
							"range_end" : 100.0,
							"range_style" : "linear",
							"range_markers" : [ 0.0 ],
							"range_labels" : [  ],
							"origin_x" : 0.0,
							"origin_y" : 0.0
						}
 ],
					"thinmode" : "none"
				}

			}
, 			{
				"box" : 				{
					"angle" : 270.0,
					"border" : 1,
					"bordercolor" : [ 0.0, 0.0, 0.0, 1.0 ],
					"grad1" : [ 1.0, 1.0, 1.0, 1.0 ],
					"grad2" : [ 1.0, 1.0, 1.0, 1.0 ],
					"id" : "obj-1",
					"maxclass" : "panel",
					"mode" : 1,
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 422.0, 216.0, 128.0, 128.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 1.375, 2.25, 392.75, 193.5 ],
					"proportion" : 0.39,
					"style" : ""
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-10", 0 ],
					"source" : [ "obj-12", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-12", 0 ],
					"source" : [ "obj-21", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-28", 0 ],
					"source" : [ "obj-21", 2 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-6", 0 ],
					"source" : [ "obj-21", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-21", 0 ],
					"source" : [ "obj-22", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-11", 0 ],
					"source" : [ "obj-27", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-30", 0 ],
					"source" : [ "obj-28", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-27", 0 ],
					"source" : [ "obj-29", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-11", 0 ],
					"source" : [ "obj-31", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-31", 0 ],
					"order" : 1,
					"source" : [ "obj-33", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-37", 0 ],
					"order" : 0,
					"source" : [ "obj-33", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-22", 0 ],
					"source" : [ "obj-36", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-11", 0 ],
					"source" : [ "obj-37", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-15", 0 ],
					"source" : [ "obj-6", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-27", 1 ],
					"source" : [ "obj-6", 2 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-32", 0 ],
					"source" : [ "obj-6", 1 ]
				}

			}
 ],
		"dependency_cache" : [ 			{
				"name" : "MI_MAT_Ground_Plan.png",
				"bootpath" : "~/CloudStation/Dev/MaxMSP/migen-formatting/Tutorial",
				"patcherrelativepath" : ".",
				"type" : "PNG ",
				"implicit" : 1
			}
, 			{
				"name" : "MI_MAT_Base_Plan.png",
				"bootpath" : "~/CloudStation/Dev/MaxMSP/migen-formatting/Tutorial",
				"patcherrelativepath" : ".",
				"type" : "PNG ",
				"implicit" : 1
			}
, 			{
				"name" : "damper.gendsp",
				"bootpath" : "~/CloudStation/Dev/MaxMSP/migen-formatting/Tutorial",
				"patcherrelativepath" : ".",
				"type" : "gDSP",
				"implicit" : 1
			}
, 			{
				"name" : "migen-lib.genexpr",
				"bootpath" : "~/Documents/Max 7/Library",
				"patcherrelativepath" : "../../../../../Documents/Max 7/Library",
				"type" : "GenX",
				"implicit" : 1
			}
 ],
		"autosave" : 0,
		"styles" : [ 			{
				"name" : "AudioStatus_Menu",
				"default" : 				{
					"bgfillcolor" : 					{
						"type" : "color",
						"color" : [ 0.294118, 0.313726, 0.337255, 1 ],
						"color1" : [ 0.454902, 0.462745, 0.482353, 0.0 ],
						"color2" : [ 0.290196, 0.309804, 0.301961, 1.0 ],
						"angle" : 270.0,
						"proportion" : 0.39,
						"autogradient" : 0
					}

				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classic",
				"default" : 				{
					"fontname" : [ "Geneva" ],
					"textcolor_inverse" : [ 0.0, 0.0, 0.0, 1.0 ],
					"patchlinecolor" : [ 0.0, 0.0, 0.0, 1.0 ],
					"accentcolor" : [ 0.498039, 0.498039, 0.498039, 1.0 ],
					"bgfillcolor" : 					{
						"type" : "color",
						"color1" : [ 0.83978, 0.839941, 0.839753, 1.0 ],
						"color2" : [ 0.290196, 0.309804, 0.301961, 1.0 ],
						"color" : [ 0.839216, 0.839216, 0.839216, 1.0 ],
						"angle" : 270.0,
						"proportion" : 0.39
					}
,
					"bgcolor" : [ 0.83978, 0.839941, 0.839753, 1.0 ],
					"fontsize" : [ 9.0 ],
					"color" : [ 0.498039, 0.498039, 0.498039, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicButton",
				"default" : 				{
					"color" : [ 1.0, 0.890196, 0.090196, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicDial",
				"default" : 				{
					"color" : [ 1.0, 0.890196, 0.090196, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicGain~",
				"default" : 				{
					"color" : [ 0.380392, 0.380392, 0.380392, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicGswitch",
				"default" : 				{
					"accentcolor" : [ 1.0, 1.0, 1.0, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicGswitch2",
				"default" : 				{
					"accentcolor" : [ 1.0, 1.0, 1.0, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicKslider",
				"default" : 				{
					"elementcolor" : [ 0.498039, 0.498039, 0.498039, 1.0 ],
					"bgcolor" : [ 0.0, 0.0, 0.0, 1.0 ],
					"selectioncolor" : [ 0.498039, 0.498039, 0.498039, 1.0 ],
					"color" : [ 1.0, 1.0, 1.0, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicLed",
				"default" : 				{
					"elementcolor" : [ 0.6, 0.0, 0.0, 1.0 ],
					"color" : [ 1.0, 0.0, 0.0, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicMatrixctrl",
				"default" : 				{
					"color" : [ 1.0, 0.0, 0.0, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicMeter~",
				"default" : 				{
					"elementcolor" : [ 0.498039, 0.498039, 0.498039, 1.0 ],
					"bgcolor" : [ 0.380392, 0.380392, 0.380392, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicNodes",
				"default" : 				{
					"elementcolor" : [ 0.498039, 0.498039, 0.498039, 1.0 ],
					"fontsize" : [ 9.0 ],
					"color" : [ 0.839216, 0.839216, 0.839216, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicNslider",
				"default" : 				{
					"color" : [ 0.0, 0.0, 0.0, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicNumber",
				"default" : 				{
					"selectioncolor" : [ 1.0, 0.890196, 0.0, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicPictslider",
				"default" : 				{
					"elementcolor" : [ 0.498039, 0.498039, 0.498039, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicPreset",
				"default" : 				{
					"color" : [ 1.0, 0.890196, 0.090196, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicScope~",
				"default" : 				{
					"bgcolor" : [ 0.498039, 0.498039, 0.498039, 1.0 ],
					"color" : [ 0.462745, 0.933333, 0.0, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicTab",
				"default" : 				{
					"elementcolor" : [ 0.839216, 0.839216, 0.839216, 1.0 ],
					"color" : [ 0.498039, 0.498039, 0.498039, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicTextbutton",
				"default" : 				{
					"accentcolor" : [ 0.0, 0.0, 0.0, 1.0 ],
					"color" : [ 1.0, 1.0, 1.0, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicToggle",
				"default" : 				{
					"elementcolor" : [ 0.376471, 0.384314, 0.4, 0.0 ],
					"color" : [ 0.380392, 0.380392, 0.380392, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicUmenu",
				"default" : 				{
					"color" : [ 1.0, 1.0, 1.0, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "classicWaveform~",
				"default" : 				{
					"selectioncolor" : [ 0.498039, 0.498039, 0.498039, 0.5 ],
					"color" : [ 0.380392, 0.380392, 0.380392, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "lightbutton",
				"default" : 				{
					"elementcolor" : [ 0.654902, 0.572549, 0.376471, 1.0 ],
					"bgcolor" : [ 0.309495, 0.299387, 0.299789, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "newobjBlue-1",
				"default" : 				{
					"accentcolor" : [ 0.317647, 0.654902, 0.976471, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "newobjCyan-1",
				"default" : 				{
					"accentcolor" : [ 0.029546, 0.773327, 0.821113, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "newobjGreen-1",
				"default" : 				{
					"accentcolor" : [ 0.0, 0.533333, 0.168627, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "newobjYellow-1",
				"default" : 				{
					"accentcolor" : [ 0.82517, 0.78181, 0.059545, 1.0 ],
					"fontsize" : [ 12.059008 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "purple",
				"default" : 				{
					"textcolor_inverse" : [ 0.701961, 0.415686, 0.886275, 1.0 ],
					"bgcolor" : [ 0.304029, 0.250694, 0.285628, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "receives",
				"default" : 				{
					"accentcolor" : [ 0.870588, 0.415686, 0.062745, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "sends",
				"default" : 				{
					"accentcolor" : [ 0.0, 0.533333, 0.168627, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "tastefulltoggle",
				"default" : 				{
					"bgcolor" : [ 0.185512, 0.263736, 0.260626, 1.0 ],
					"color" : [ 0.941176, 0.690196, 0.196078, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
, 			{
				"name" : "tastefultoggle",
				"default" : 				{
					"elementcolor" : [ 0.654902, 0.572549, 0.376471, 1.0 ],
					"bgcolor" : [ 0.287863, 0.333333, 0.329398, 1.0 ],
					"color" : [ 0.941176, 0.690196, 0.196078, 1.0 ]
				}
,
				"parentstyle" : "",
				"multi" : 0
			}
 ]
	}

}
