import {kriging} from './kriging';

function _getKrigingGridInfo(featureCollection,weight,krigingParams){
    //先获取featureCollection的bbox
    let values=[],lons=[],lats=[];
    let extent=[100000000,100000000,-100000000,-100000000];
    featureCollection.features.forEach(feature => {
        //提取插值权重字段，准备克里金插值使用
        values.push(feature.properties[weight]);
        lons.push(feature.geometry.coordinates[0]);
        lats.push(feature.geometry.coordinates[1]);
        if(extent[0]>feature.geometry.coordinates[0])
            extent[0]=feature.geometry.coordinates[0];
        if(extent[1]>feature.geometry.coordinates[1])
            extent[1]=feature.geometry.coordinates[1];
        if(extent[2]<feature.geometry.coordinates[0])
            extent[2]=feature.geometry.coordinates[0];
        if(extent[3]<feature.geometry.coordinates[1])
            extent[3]=feature.geometry.coordinates[1];
    });
    let variogram=kriging.train(values,lons,lats,krigingParams.model,krigingParams.sigma2,krigingParams.alpha);
    let gridinfo=kriging.getGridInfo(extent,variogram,200);
    return gridinfo;
}

function _getImageKrigingGridInfo(xlim,ylim,weight,krigingParams){
    //先获取featureCollection的bbox
    let values=[],lons=[],lats=[];
    let extent=[xlim[0],ylim[0],xlim[1],ylim[1]];
    featureCollection.features.forEach(feature => {
        //提取插值权重字段，准备克里金插值使用
        values.push(feature.properties[weight]);
        lons.push(feature.geometry.coordinates[0]);
        lats.push(feature.geometry.coordinates[1]);
    });
    let variogram=kriging.train(values,lons,lats,krigingParams.model,krigingParams.sigma2,krigingParams.alpha);
    let gridinfo=kriging.getGridInfo(extent,variogram,200);
    return gridinfo;
}
  
/*
* 克里金生成矢量等值面，浏览器和node都可以使用
* @param {json} featureCollection：必填，已有点数据，geojson格式
* @param {string} weight：必填，插值所依赖的圈中字段
* @param {object) krigingParams：必填，克里金插值算法参数设置
    krigingParams:{
         krigingModel:'exponential','gaussian','spherical'，三选一
         krigingSigma2:
         krigingAlpha:
    }
* @param {array} breaks：必填，等值面分级区间
*/
function getVectorContour(featureCollection,weight,krigingParams,breaks){
    let gridinfo=_getKrigingGridInfo(featureCollection,weight,krigingParams);
    let vectorContour=kriging.getVectorContour(gridinfo,breaks);
    return vectorContour;
};

/*
* 克里金生成栅格等值面并绘制到canvas上，仅浏览器中使用
* @param {json} featureCollection：必填，已有点数据，geojson格式
* @param {string} weight：必填，插值所依赖的圈中字段
* @param {object) krigingParams：必填，克里金插值算法参数设置
    krigingParams:{
         krigingModel:'exponential','gaussian','spherical'，三选一
         krigingSigma2:
         krigingAlpha:
    }
* @param {dom) canvas：必填，绑定渲染的canvas dom
* @param {array) colors：必填，等值面分级区间
*/
function drawCanvasContour(featureCollection,weight,krigingParams,canvas,xlim,ylim,colors) {
    let gridinfo=_getImageKrigingGridInfo(xlim,ylim,weight,krigingParams);
    kriging.drawCanvasContour(gridinfo,canvas,xlim,ylim,colors);
};






export {getVectorContour,drawCanvasContour};
